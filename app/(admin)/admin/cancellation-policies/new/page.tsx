import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PolicyForm from "@/components/admin/PolicyForm";

export const metadata: Metadata = { title: "New Cancellation Policy — Admin" };

export default function NewPolicyPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/cancellation-policies"
          className="inline-flex items-center gap-1.5 text-xs text-stone hover:text-sand transition-colors mb-4 group"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          All policies
        </Link>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">New Cancellation Policy</h1>
      </div>
      <PolicyForm mode="create" />
    </div>
  );
}
