"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import type { DashboardData } from "@/app/dashboard/page";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] flex items-center justify-center text-gray-500 text-sm">
      Loading map...
    </div>
  ),
});

export default function TerritoryMap({
  territories = [],
  routes = [],
}: {
  territories: DashboardData["territories"];
  routes: DashboardData["routes"];
}) {
  return (
    <div className="bg-[#161B24] border border-blue-500/15 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-500/10">
        <p className="text-sm font-medium">Territory map</p>
        <span className="text-xs text-gray-500">Your area</span>
      </div>

      <div className="h-[400px]">
        <MapView territories={territories} routes={routes} />
      </div>

      <div className="flex gap-4 px-4 py-2.5 text-xs text-gray-500 border-t border-blue-500/10">
        <LegendItem color="rgba(6,182,212,0.4)" label="Territory (closed loop)" />
        <LegendItem color="rgba(56,139,253,0.7)" label="Route (open)" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </div>
  );
}