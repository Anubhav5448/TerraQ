"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Square, Loader2 } from "lucide-react";
import { useActivityTracker, type ActivityResult } from "@/hooks/useActivityTracker";
import { apiPost } from "@/lib/api";
import { registerActivitySW, notifyActivityStart, notifyActivityStop, onSWStopCommand } from "@/lib/activitySW";

type ActivityType = "running" | "cycling" | "walking";

interface SubmitResponse {
  xpEarned: number;
  territoryClaimed: boolean;
  newLevel: number;
}

function useTimer(running: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      setElapsed(0);
      intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function ActivityTracker({ onComplete }: { onComplete: () => void }) {
  const { isTracking, distanceM, error, start, stop } = useActivityTracker();
  const [activityType, setActivityType] = useState<ActivityType>("running");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const timer = useTimer(isTracking);
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      onSWStopCommand(() => {
        if (isTracking) handleStop();
      });
    }
  }, [isTracking]);

const handleStop = async () => {
    notifyActivityStop();
    const activity = stop(activityType);
    if (!activity) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await apiPost<SubmitResponse>("/api/activities", activity);
      setResult(res);
      onComplete();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save activity");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#161B24] border border-blue-500/15 rounded-lg p-4 mb-6">
      {!isTracking ? (
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as ActivityType)}
            className="bg-[#0D1117] border border-blue-500/20 rounded-lg text-sm text-gray-200 px-3 py-2.5 focus:outline-none focus:border-blue-400"
            disabled={submitting}
          >
            <option value="running">Running</option>
            <option value="cycling">Cycling</option>
            <option value="walking">Walking</option>
          </select>

          <button
            onClick={() => {
              registerActivitySW().then(() => notifyActivityStart(activityType));
              start(activityType);
            }}
            disabled={submitting}
            className="bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white font-medium text-sm rounded-lg px-4 py-2.5 flex items-center gap-2 transition-colors"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {submitting ? "Saving..." : "Start activity"}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm text-gray-400">Tracking {activityType}...</p>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-2xl font-semibold font-mono">{timer}</p>
              <p className="text-lg text-gray-300">{(distanceM / 1000).toFixed(2)} km</p>
            </div>
          </div>
          <button
            onClick={handleStop}
            className="bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 font-medium text-sm rounded-lg px-4 py-2.5 flex items-center gap-2 transition-colors"
          >
            <Square size={14} />
            Stop & save
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      {submitError && <p className="text-sm text-red-400 mt-2">{submitError}</p>}
      {result && (
        <p className="text-sm text-cyan-400 mt-2">
          +{result.xpEarned} XP
          {result.territoryClaimed ? " · Territory claimed! 🎉" : " · Route saved"}
          {result.newLevel > 1 ? ` · Level ${result.newLevel}` : ""}
        </p>
      )}
    </div>
  );
}