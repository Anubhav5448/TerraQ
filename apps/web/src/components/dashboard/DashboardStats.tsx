import { Map, AreaChart, Zap, Route } from "lucide-react";
import type { DashboardData } from "@/app/dashboard/page";

export default function DashboardStats({ data }: { data: DashboardData }) {
  const stats = [
    { icon: Map, label: "Territories", value: data.territoriesOwned },
    { icon: AreaChart, label: "Area claimed", value: `${data.totalAreaKm2.toFixed(4)} km²` },
    { icon: Zap, label: "Total XP", value: data.xp.toLocaleString() },
    { icon: Route, label: "Distance (week)", value: `${data.distanceWeekKm.toFixed(1)} km` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="bg-[#161B24] border border-blue-500/15 rounded-lg p-3.5">
          <div className="w-7 h-7 rounded-md bg-cyan-400/10 text-cyan-400 flex items-center justify-center mb-2">
            <s.icon size={14} />
          </div>
          <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-0.5">{s.label}</p>
          <p className="text-lg font-semibold">{s.value}</p>
        </div>
      ))}
    </div>
  );
}