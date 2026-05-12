import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login — Rammies Vacation",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  const showResetSuccess = message === "password-reset";

  return (
    <div className="relative min-h-screen bg-charcoal flex items-center justify-center px-4">

      {/* Back to public site */}
      <div className="absolute top-5 left-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-stone-light/40 hover:text-stone-light/80 transition-colors"
        >
          <ArrowLeft size={12} />
          Rammies Vacation
        </Link>
      </div>

      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(181,149,106,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-sm">

        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            style={{
              background:
                "linear-gradient(160deg, #0F2945 0%, #1B3A6B 50%, #C8834A 100%)",
            }}
          >
            <span className="font-serif text-white/60 text-sm font-semibold">RV</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-white">
            Rammies Vacation
          </h1>
          <p className="text-stone-light text-xs mt-1">Owner dashboard</p>
        </div>

        {/* Password reset success banner */}
        {showResetSuccess && (
          <div role="status" className="flex items-start gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 py-3 mb-4">
            <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
            <span>
              Password reset successfully. Please sign in with your new
              password.
            </span>
          </div>
        )}

        {/* Login card */}
        <div className="bg-[#232119] border border-white/8 rounded-card p-7">
          <h2 className="font-serif text-lg font-semibold text-white mb-5">
            Sign in
          </h2>
          <AdminLoginForm />
        </div>

        <p className="text-center text-xs text-stone-light/50 mt-6">
          Access is restricted to authorised users only.
        </p>

      </div>
    </div>
  );
}
