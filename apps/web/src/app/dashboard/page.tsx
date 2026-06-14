"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import TerritoryMap from "@/components/dashboard/TerritoryMap";
import ActivityTracker from "@/components/dashboard/ActivityTracker";

export interface GeoPoint { lat: number; lng: number; timestamp?: number; }

export interface TerritoryData {
  id: string;
  points: GeoPoint[];
  areaM2: number;
  createdAt: string;
}

export interface RouteData {
  id: string;
  points: GeoPoint[];
  isClosed: boolean;
  createdAt: string;
}

export interface DashboardData {
  username: string;
  xp: number;
  level: number;
  territoriesOwned: number;
  totalAreaKm2: number;
  distanceWeekKm: number;
  territories: TerritoryData[];
  routes: RouteData[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchDashboard = () => {
    apiGet<DashboardData>("/api/users/me/dashboard")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    fetchDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center text-red-400">
        {error || "Failed to load dashboard"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <DashboardHeader username={data.username} />
        <ActivityTracker onComplete={fetchDashboard} />
        <DashboardStats data={data} />
        <TerritoryMap territories={data.territories} routes={data.routes} />
      </div>
    </div>
  );
}