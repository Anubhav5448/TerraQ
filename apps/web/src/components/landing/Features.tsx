import { Map, Flame, Trophy } from "lucide-react";

const features = [
  {
    icon: Map,
    title: "Claim tiles",
    desc: "Every route you complete claims the grid tiles you pass through.",
  },
  {
    icon: Flame,
    title: "Build streaks",
    desc: "Revisit your tiles to grow streaks and lock in ownership.",
  },
  {
    icon: Trophy,
    title: "Climb the board",
    desc: "Earn XP from distance and compete for the most territory.",
  },
];

export default function Features() {
  return (
    <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-20 max-w-5xl mx-auto">
      {features.map((f) => (
        <div key={f.title} className="border border-blue-500/15 rounded-xl p-6">
          <div className="w-9 h-9 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400 mb-4">
            <f.icon size={18} />
          </div>
          <p className="text-base font-medium mb-2">{f.title}</p>
          <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}