"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileTabs from "@/components/profile/ProfileTabs";

export interface FullUser {
  id: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  activityType: "running" | "cycling" | "walking";
  avatarUrl?: string | null;
  createdAt: string;
  _count: { tiles: number };
}

export default function ProfilePage() {
  const [user, setUser] = useState<FullUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    apiGet<{ user: FullUser }>("/api/users/me")
      .then((res) => setUser(res.user))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center text-red-400">
        {error || "Failed to load profile"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <ProfileHeader user={user} onUserUpdate={setUser} />
        <ProfileStats user={user} />
        <ProfileTabs user={user} onUserUpdate={setUser} />
      </div>
    </div>
  );
}