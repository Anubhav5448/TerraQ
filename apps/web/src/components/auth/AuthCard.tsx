"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TopoBackground from "./TopoBackground";
import Link from "next/link";
import {
  loginSchema,
  signupSchema,
  type LoginInput,
  type SignupInput,
} from "@/lib/validators/auth";
import Field from "../ui/Field";
import { apiPost } from "@/lib/api";
import { setAuth } from "@/lib/auth";


type Mode = "login" | "signup";

export default function AuthCard({ mode: initialMode }: { mode: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-[#0D1117] flex items-center justify-center p-4">
      <TopoBackground />
      <Link
        href="/"
        className="absolute top-6 left-6 text-[11px] tracking-widest text-blue-400 uppercase hover:text-blue-300 transition-colors z-10"
      >
        ← TerrainQuest
      </Link>
      <div className="relative z-10 w-full max-w-sm bg-[#161B24]/90 border border-blue-500/20 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex gap-2 mb-6">
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                router.replace(m === "login" ? "/login" : "/signup");
              }}
              className={`flex-1 py-2 rounded-lg text-sm border transition-all ${
                mode === m
                  ? "bg-blue-500/10 border-blue-400 text-blue-400"
                  : "bg-transparent border-blue-500/20 text-gray-500 hover:text-gray-300"
              }`}
            >
              {m === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        {mode === "login" ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  );
}

// Password field component with eye button
function PasswordField({ label, error, ...props }: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-400">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className="w-full bg-[#0D1117] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400 transition-colors"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      const result = await apiPost<{ token: string; user: { id: string; username: string; email: string } }>(
        "/api/auth/login",
        data
      );
      setAuth(result.token, result.user);
      router.push("/");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <PasswordField
        label="Password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />
      {serverError && (
        <p className="text-sm text-red-400 text-center">{serverError}</p>
      )}
      <SubmitButton loading={isSubmitting}>Sign in</SubmitButton>
      <p className="text-center text-sm text-gray-500 mt-1">
        <a href="#" className="text-blue-400 hover:text-blue-300">
          Forgot password?
        </a>
      </p>
    </form>
  );
}

function SignupForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setServerError(null);
    try {
      const result = await apiPost<{ token: string; user: { id: string; username: string; email: string } }>(
        "/api/auth/signup",
        data
      );
      setAuth(result.token, result.user);
      router.push("/");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
      <PasswordField
        label="Password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />
      {serverError && (
        <p className="text-sm text-red-400 text-center">{serverError}</p>
      )}
      <SubmitButton loading={isSubmitting}>Create account</SubmitButton>
    </form>
  );
}

function SubmitButton({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg py-2.5 transition-colors mt-1"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
