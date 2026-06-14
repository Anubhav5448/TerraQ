"use client";

import { useRef, useState, useCallback } from "react";
import { gpsToTile, haversineDistance } from "@/lib/geo";
import { notifyActivityStart, notifyActivityStop, registerActivitySW, onSWStopCommand } from "@/lib/activitySW";

export interface TrackPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface ActivityResult {
  type: "running" | "cycling" | "walking";
  distanceM: number;
  durationS: number;
  tiles: { tileX: number; tileY: number }[];
  startedAt: string;
  endedAt: string;
  points: TrackPoint[];
}

export function useActivityTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [points, setPoints] = useState<TrackPoint[]>([]);
  const [distanceM, setDistanceM] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastPointRef = useRef<TrackPoint | null>(null);

  const start = useCallback((type: "running" | "cycling" | "walking" = "running") => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported on this device");
      return;
    }

    setError(null);
    setPoints([]);
    setDistanceM(0);
    lastPointRef.current = null;
    startTimeRef.current = Date.now();
    setIsTracking(true);

    // Register SW + show persistent notification
    registerActivitySW().then(() => {
      notifyActivityStart(type);
    });

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const point: TrackPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: Date.now(),
        };

        setPoints((prev) => [...prev, point]);

        if (lastPointRef.current) {
          const d = haversineDistance(
            lastPointRef.current.lat,
            lastPointRef.current.lng,
            point.lat,
            point.lng
          );
          // Ignore GPS noise: skip jumps under 2m or over 100m (likely error)
          if (d > 2 && d < 100) {
            setDistanceM((prev) => prev + d);
          }
        }
        lastPointRef.current = point;
      },
      (err) => {
        setError(err.message);
        setIsTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  }, []);

  const stop = useCallback((type: "running" | "cycling" | "walking"): ActivityResult | null => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    notifyActivityStop();

    if (points.length === 0 || !startTimeRef.current) return null;

    const tileSet = new Map<string, { tileX: number; tileY: number }>();
    points.forEach((p) => {
      const tile = gpsToTile(p.lat, p.lng);
      tileSet.set(`${tile.tileX},${tile.tileY}`, tile);
    });

    const durationS = Math.round((Date.now() - startTimeRef.current) / 1000);

    return {
      type,
      distanceM,
      durationS,
      tiles: Array.from(tileSet.values()),
      startedAt: new Date(startTimeRef.current).toISOString(),
      endedAt: new Date().toISOString(),
      points,
    };
  }, [points, distanceM]);

  const reset = useCallback(() => {
    setPoints([]);
    setDistanceM(0);
    lastPointRef.current = null;
    startTimeRef.current = null;
  }, []);

  return { isTracking, points, distanceM, error, start, stop, reset };
}