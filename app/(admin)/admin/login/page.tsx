import type { Metadata } from "next";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login — Rammies Vacation",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-4">

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

        {/* Login card */}
        <div className="bg-[#232119] border border-white/8 rounded-[var(--radius-card)] p-7">
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
