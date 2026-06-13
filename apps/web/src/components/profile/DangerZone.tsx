"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiDelete } from "@/lib/api";
import { clearAuth } from "@/lib/auth";


export default function DangerZone() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setLoading(true);
    try {
      await apiDelete("/api/users/me");
      clearAuth();
      router.push("/");
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="border border-red-500/20 rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
      <div>
        <p className="text-sm font-medium">Delete account</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {confirming
            ? "Are you sure? This cannot be undone."
            : "Permanently remove your account and all data"}
        </p>
      </div>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-60"
      >
        {loading ? "Deleting…" : confirming ? "Confirm delete" : "Delete"}
      </button>
    </div>
  );
}