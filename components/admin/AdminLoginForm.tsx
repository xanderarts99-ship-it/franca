"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function AdminLoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    setServerError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Invalid credentials. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-light">
          Email address
        </label>
        <div className="relative">
          <Mail
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-light/50 pointer-events-none"
          />
          <input
            type="email"
            autoComplete="email"
            placeholder="franca@example.com"
            {...register("email")}
            className={cn(
              "w-full pl-9 pr-4 py-3 text-sm rounded-xl border bg-white/5 text-white placeholder:text-stone-light/30 focus:outline-none focus:ring-2 focus:ring-sand/50 focus:border-transparent transition-all",
              errors.email
                ? "border-red-500/50 focus:ring-red-500/30"
                : "border-white/10"
            )}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-400 flex items-center gap-1.5">
            <AlertCircle size={11} />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-light">
          Password
        </label>
        <div className="relative">
          <Lock
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-light/50 pointer-events-none"
          />
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
            className={cn(
              "w-full pl-9 pr-10 py-3 text-sm rounded-xl border bg-white/5 text-white placeholder:text-stone-light/30 focus:outline-none focus:ring-2 focus:ring-sand/50 focus:border-transparent transition-all",
              errors.password
                ? "border-red-500/50 focus:ring-red-500/30"
                : "border-white/10"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-light/40 hover:text-stone-light transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-400 flex items-center gap-1.5">
            <AlertCircle size={11} />
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-3">
          <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 mt-1 rounded-full bg-sand hover:bg-sand-dark text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-sand/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>

    </form>
  );
}
