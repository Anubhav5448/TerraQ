"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Map, Zap, Clock, Route } from "lucide-react";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface ActivitySession {
  id: string;
  type: string;
  distanceM: number;
  durationS: number;
  xpEarned: number;
  startedAt: string;
  endedAt?: string;
  territoryId?: string;
}

interface ActivitiesResponse {
  sessions: ActivitySession[];
  total: number;
  page: number;
  totalPages: number;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const typeColors: Record<string, string> = {
  running: "text-cyan-400 bg-cyan-400/10",
  cycling: "text-blue-400 bg-blue-400/10",
  walking: "text-green-400 bg-green-400/10",
};

export default function ActivitiesPage() {
  const [data, setData] = useState<ActivitiesResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) { router.push("/login"); return; }
    setLoading(true);
    apiGet<ActivitiesResponse>(`/api/users/me/activities?page=${page}`)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, router]);

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <h1 className="text-xl font-semibold mb-6">Activity history</h1>

        {loading && (
          <div className="text-center text-gray-500 py-12">Loading...</div>
        )}

        {error && (
          <div className="text-center text-red-400 py-12">{error}</div>
        )}

        {data && data.sessions.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No activities yet — start your first run!
          </div>
        )}

        {data && data.sessions.length > 0 && (
          <>
            <div className="space-y-3">
              {data.sessions.map((s) => (
                <div
                  key={s.id}
                  className="bg-[#161B24] border border-blue-500/15 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${typeColors[s.type] || "text-gray-400 bg-gray-400/10"}`}>
                        {s.type}
                      </span>
                      {s.territoryId && (
                        <span className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
                          Territory claimed
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(s.startedAt)}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <Stat icon={Route} label="Distance" value={`${(s.distanceM / 1000).toFixed(2)} km`} />
                    <Stat icon={Clock} label="Duration" value={formatDuration(s.durationS)} />
                    <Stat icon={Zap} label="XP earned" value={`+${s.xpEarned}`} />
                    <Stat icon={Map} label="Territory" value={s.territoryId ? "Yes" : "No"} />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-sm text-gray-400 hover:text-white disabled:opacity-40 transition-colors px-3 py-1.5 border border-blue-500/20 rounded-lg"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  {page} / {data.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="text-sm text-gray-400 hover:text-white disabled:opacity-40 transition-colors px-3 py-1.5 border border-blue-500/20 rounded-lg"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-gray-500 mb-0.5">
        <Icon size={11} />
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}