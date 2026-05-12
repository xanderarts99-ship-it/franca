"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Lock, AlertCircle, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ChangePasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    setServerError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/settings/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
      reset();
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <PasswordField
        label="Current Password"
        show={showCurrent}
        onToggle={() => setShowCurrent((v) => !v)}
        registration={register("currentPassword")}
        error={errors.currentPassword?.message}
        autoComplete="current-password"
      />
      <PasswordField
        label="New Password"
        show={showNew}
        onToggle={() => setShowNew((v) => !v)}
        registration={register("newPassword")}
        error={errors.newPassword?.message}
        autoComplete="new-password"
      />
      <PasswordField
        label="Confirm New Password"
        show={showConfirm}
        onToggle={() => setShowConfirm((v) => !v)}
        registration={register("confirmPassword")}
        error={errors.confirmPassword?.message}
        autoComplete="new-password"
      />

      {serverError && (
        <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-3">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 py-3">
          <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
          <span>Password updated successfully.</span>
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
          "Update Password"
        )}
      </button>
    </form>
  );
}

function PasswordField({
  label,
  show,
  onToggle,
  registration,
  error,
  autoComplete,
}: {
  label: string;
  show: boolean;
  onToggle: () => void;
  registration: UseFormRegisterReturn;
  error?: string;
  autoComplete: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-light">
        {label}
      </label>
      <div className="relative">
        <Lock
          size={13}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-light/50 pointer-events-none"
        />
        <input
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
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
