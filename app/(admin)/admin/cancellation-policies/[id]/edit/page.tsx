import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import PolicyForm from "@/components/admin/PolicyForm";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Edit Policy — Admin" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPolicyPage({ params }: PageProps) {
  const { id } = await params;

  const policy = await prisma.cancellationPolicy.findUnique({ where: { id } });
  if (!policy) notFound();

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
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Edit Policy</h1>
        <p className="text-stone text-sm mt-0.5">{policy.name}</p>
      </div>
      <PolicyForm
        mode="edit"
        policyId={policy.id}
        defaultValues={{
          name: policy.name,
          policyText: policy.policyText,
          fullRefundDays: policy.fullRefundDays,
          partialRefundDays: policy.partialRefundDays,
          partialRefundPercentage: policy.partialRefundPercentage,
          isDefault: policy.isDefault,
        }}
      />
    </div>
  );
}
