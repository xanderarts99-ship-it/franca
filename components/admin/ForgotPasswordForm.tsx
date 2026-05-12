// components/admin/ForgotPasswordForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
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
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (!res.ok) {
        setServerError("Something went wrong. Please try again.");
        return;
      }

      setSent(true);
    } catch {
      setServerError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-2">
        <CheckCircle2 size={32} className="text-emerald-400" />
        <h2 className="font-serif text-lg font-semibold text-white text-center">
          Check your email
        </h2>
        <p className="text-sm text-stone-light/70 text-center leading-relaxed">
          If that address is registered, you&apos;ll receive a reset link
          shortly. The link expires in 1 hour.
        </p>
        <Link
          href="/admin/login"
          className="mt-2 text-xs text-sand hover:text-sand-dark transition-colors"
        >
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="font-serif text-lg font-semibold text-white mb-2">
        Forgot password?
      </h2>
      <p className="text-xs text-stone-light/60 mb-5 leading-relaxed">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
              placeholder="rammies@example.com"
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

        {serverError && (
          <div role="alert" className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-3">
            <AlertCircle size={13} className="mt-0.5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 mt-1 rounded-full bg-sand hover:bg-sand-dark text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-sand/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Sending…
            </>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>
    </>
  );
}
