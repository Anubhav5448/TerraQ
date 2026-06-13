"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiPatch } from "@/lib/api";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validators/profile";
import Field from "@/components/ui/Field";
import type { FullUser } from "@/app/profile/page";

export default function AccountSettingsTab({
  user,
  onUserUpdate,
}: {
  user: FullUser;
  onUserUpdate: (user: FullUser) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
      activityType: user.activityType,
    },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    setServerError(null);
    setSuccess(false);
    try {
      const result = await apiPatch<{ user: Partial<FullUser> }>("/api/users/me", data);
      onUserUpdate({ ...user, ...result.user });
      setSuccess(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Username"
          type="text"
          placeholder="trailrunner92"
          error={errors.username?.message}
          {...register("username")}
        />
        <Field
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1.5 tracking-wide">
          Activity type
        </label>
        <select
          {...register("activityType")}
          className="w-full bg-[#0D1117] border border-blue-500/20 rounded-lg text-sm text-gray-200 px-3 py-2.5 focus:outline-none focus:border-blue-400 transition-colors"
        >
          <option value="running">Running</option>
          <option value="cycling">Cycling</option>
          <option value="walking">Walking</option>
        </select>
      </div>

      {serverError && <p className="text-sm text-red-400">{serverError}</p>}
      {success && <p className="text-sm text-cyan-400">Profile updated</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white font-medium text-sm rounded-lg px-5 py-2.5 transition-colors"
      >
        {isSubmitting ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}