import type { Metadata } from "next";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export const metadata: Metadata = {
  title: "Settings — Rammies Vacation",
};

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-7">
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Settings</h1>
        <p className="text-stone text-sm mt-0.5">Manage your admin account.</p>
      </div>

      <div className="border-t border-warm-border pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          <div>
            <h2 className="text-sm font-semibold text-charcoal">Security</h2>
            <p className="text-xs text-stone mt-1.5 leading-relaxed">
              Update your admin account password. Use a strong, unique password with at least 8 characters.
            </p>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-[#232119] border border-white/8 rounded-card p-7">
              <ChangePasswordForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
