const stats = [
  { label: "Tiles claimed", value: "12.4k" },
  { label: "Active players", value: "3.2k" },
  { label: "Distance tracked", value: "89k km" },
];

export default function Stats() {
  return (
    <div className="flex justify-center gap-12 px-6 pb-16 flex-wrap">
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <div className="text-2xl font-semibold text-cyan-400">{s.value}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}