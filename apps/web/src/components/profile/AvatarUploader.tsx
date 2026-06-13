"use client";

import { useRef, useState } from "react";
import { apiUpload, apiDelete } from "@/lib/api";
import { getUser, setAuth, getToken } from "@/lib/auth";
import type { FullUser } from "@/app/profile/page";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function AvatarUploader({
  user,
  onUserUpdate,
}: {
  user: FullUser;
  onUserUpdate: (user: FullUser) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);
    try {
      const result = await apiUpload<{ user: Partial<FullUser> }>("/api/users/me/avatar", file);
      onUserUpdate({ ...user, ...result.user });
      const stored = getUser();
      const token = getToken();
      if (stored && token) {
        setAuth(token, { ...stored, avatarUrl: result.user.avatarUrl });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await apiDelete<{ user: Partial<FullUser> }>("/api/users/me/avatar");
      onUserUpdate({ ...user, ...result.user });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove avatar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-2xl font-semibold text-blue-400 overflow-hidden">
        {user.avatarUrl ? (
          <img
            src={`${API_URL}${user.avatarUrl}`}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          user.username.slice(0, 2).toUpperCase()
        )}
      </div>

      <div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="text-sm border border-blue-500/30 text-gray-200 hover:bg-blue-500/10 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-60"
          >
            {user.avatarUrl ? "Change" : "Upload"}
          </button>
          {user.avatarUrl && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={loading}
              className="text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-60"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1.5">JPG, PNG or WEBP. Max 2MB.</p>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}