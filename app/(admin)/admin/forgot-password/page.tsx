// app/(admin)/admin/forgot-password/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ForgotPasswordForm from "@/components/admin/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password — Rammies Vacation",
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative min-h-screen bg-charcoal flex items-center justify-center px-4">
      <div className="absolute top-5 left-5">
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-1.5 text-xs text-stone-light/40 hover:text-stone-light/80 transition-colors"
        >
          <ArrowLeft size={12} />
          Back to sign in
        </Link>
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(181,149,106,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            style={{
              background:
                "linear-gradient(160deg, #0F2945 0%, #1B3A6B 50%, #C8834A 100%)",
            }}
          >
            <span className="font-serif text-white/60 text-sm font-semibold">
              RV
            </span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-white">
            Rammies Vacation
          </h1>
          <p className="text-stone-light text-xs mt-1">Owner dashboard</p>
        </div>

        <div className="bg-[#232119] border border-white/8 rounded-card p-7">
          <ForgotPasswordForm />
        </div>

        <p className="text-center text-xs text-stone-light/50 mt-6">
          Access is restricted to authorised users only.
        </p>
      </div>
    </div>
  );
}
