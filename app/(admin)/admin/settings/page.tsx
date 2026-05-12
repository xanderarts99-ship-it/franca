import type { Metadata } from "next";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export const metadata: Metadata = {
  title: "Settings — Rammies Vacation",
};

export default function SettingsPage() {
  return (
    <div className="max-w-sm">
      <div className="bg-[#232119] border border-white/8 rounded-card p-7">
        <h2 className="font-serif text-lg font-semibold text-white mb-1">
          Change Password
        </h2>
        <p className="text-xs text-stone-light/60 mb-5 leading-relaxed">
          Update your admin account password.
        </p>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
