import type { FullUser } from "@/app/profile/page";
import AvatarUploader from "./AvatarUploader";

export default function ProfileHeader({
  user,
  onUserUpdate,
}: {
  user: FullUser;
  onUserUpdate: (user: FullUser) => void;
}) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <AvatarUploader user={user} onUserUpdate={onUserUpdate} />
      <div>
        <p className="text-xl font-semibold">{user.username}</p>
        <p className="text-sm text-gray-500">{user.email}</p>
        <span className="inline-flex items-center gap-1 bg-cyan-400/10 text-cyan-400 text-xs px-2.5 py-0.5 rounded-full mt-1.5">
          Level {user.level} · {user.xp.toLocaleString()} XP
        </span>
      </div>
    </div>
  );
}