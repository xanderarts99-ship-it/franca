// components/admin/ResetPasswordForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Lock, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <p className="text-sm text-stone-light/70">This reset link is invalid.</p>
        <Link
          href="/admin/forgot-password"
          className="text-xs text-sand hover:text-sand-dark transition-colors"
        >
          Request a new reset link →
        </Link>
      </div>
    );
  }

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    setServerError("");

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: data.newPassword }),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/admin/login?message=password-reset");
    } catch {
      setServerError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h2 className="font-serif text-lg font-semibold text-white mb-2">
        Set new password
      </h2>
      <p className="text-xs text-stone-light/60 mb-5 leading-relaxed">
        Choose a strong password for your admin account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <PasswordField
          id="newPassword"
          label="New Password"
          show={showNew}
          onToggle={() => setShowNew((v) => !v)}
          registration={register("newPassword")}
          error={errors.newPassword?.message}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          show={showConfirm}
          onToggle={() => setShowConfirm((v) => !v)}
          registration={register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

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
              Updating…
            </>
          ) : (
            "Set new password"
          )}
        </button>
      </form>
    </>
  );
}

function PasswordField({
  id,
  label,
  show,
  onToggle,
  registration,
  error,
}: {
  id: string;
  label: string;
  show: boolean;
  onToggle: () => void;
  registration: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[10px] font-semibold uppercase tracking-wider text-stone-light">
        {label}
      </label>
      <div className="relative">
        <Lock
          size={13}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-light/50 pointer-events-none"
        />
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete="new-password"
          placeholder="••••••••"
          {...registration}
          className={cn(
            "w-full pl-9 pr-10 py-3 text-sm rounded-xl border bg-white/5 text-white placeholder:text-stone-light/30 focus:outline-none focus:ring-2 focus:ring-sand/50 focus:border-transparent transition-all",
            error
              ? "border-red-500/50 focus:ring-red-500/30"
              : "border-white/10"
          )}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-light/40 hover:text-stone-light transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}
