"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiPatch } from "@/lib/api";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validators/profile";

export default function SecurityTab() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    setServerError(null);
    setSuccess(false);
    try {
      await apiPatch("/api/users/me/password", data);
      setSuccess(true);
      reset();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Password change failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
      <div>
        <label className="block text-xs text-gray-500 mb-1.5 tracking-wide">
          Current password
        </label>
        <input
          type="password"
          {...register("currentPassword")}
          className="w-full bg-[#0D1117] border border-blue-500/20 rounded-lg text-sm text-gray-200 px-3 py-2.5 focus:outline-none focus:border-blue-400 transition-colors"
        />
        {errors.currentPassword && (
          <p className="text-xs text-red-400 mt-1.5">{errors.currentPassword.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1.5 tracking-wide">
          New password
        </label>
        <input
          type="password"
          {...register("newPassword")}
          className="w-full bg-[#0D1117] border border-blue-500/20 rounded-lg text-sm text-gray-200 px-3 py-2.5 focus:outline-none focus:border-blue-400 transition-colors"
        />
        {errors.newPassword && (
          <p className="text-xs text-red-400 mt-1.5">{errors.newPassword.message}</p>
        )}
      </div>

      {serverError && <p className="text-sm text-red-400">{serverError}</p>}
      {success && <p className="text-sm text-cyan-400">Password updated</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white font-medium text-sm rounded-lg px-5 py-2.5 transition-colors"
      >
        {isSubmitting ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}