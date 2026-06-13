import type { FullUser } from "@/app/profile/page";

export default function ProfileStats({ user }: { user: FullUser }) {
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const stats = [
    { label: "Tiles owned", value: user._count.tiles },
    { label: "Activity type", value: capitalize(user.activityType) },
    { label: "Member since", value: memberSince },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {stats.map((s) => (
        <div key={s.label} className="bg-[#161B24] border border-blue-500/15 rounded-lg p-3.5">
          <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">{s.label}</p>
          <p className="text-lg font-semibold">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}