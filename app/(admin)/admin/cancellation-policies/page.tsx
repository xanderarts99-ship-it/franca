import type { Metadata } from "next";
import Link from "next/link";
import { Plus, ShieldCheck, Pencil, Trash2, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DeletePolicyButton from "@/components/admin/DeletePolicyButton";

export const metadata: Metadata = { title: "Cancellation Policies — Admin" };

export default async function CancellationPoliciesPage() {
  const policies = await prisma.cancellationPolicy.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { properties: true } } },
  });

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-charcoal">Cancellation Policies</h1>
          <p className="text-stone text-sm mt-0.5">{policies.length} polic{policies.length !== 1 ? "ies" : "y"}</p>
        </div>
        <Link
          href="/admin/cancellation-policies/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sand text-white text-sm font-semibold rounded-full hover:bg-sand-dark transition-all hover:shadow-md hover:shadow-sand/20"
        >
          <Plus size={14} />
          New Policy
        </Link>
      </div>

      {policies.length === 0 ? (
        <div className="bg-white border border-warm-border rounded-card p-10 text-center">
          <ShieldCheck size={28} className="text-stone-light mx-auto mb-3" />
          <p className="text-sm font-medium text-charcoal mb-1">No policies yet</p>
          <p className="text-xs text-stone-light">Create your first cancellation policy above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="bg-white border border-warm-border rounded-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck size={14} className="text-sand shrink-0" />
                    <h2 className="font-semibold text-charcoal text-sm">{policy.name}</h2>
                    {policy.isDefault && (
                      <span className="text-[10px] font-semibold text-white bg-sand px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone leading-relaxed line-clamp-2 mb-3">
                    {policy.policyText}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-stone-light">
                    <Building2 size={11} className="shrink-0" />
                    <span>{policy._count.properties} propert{policy._count.properties !== 1 ? "ies" : "y"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={`/admin/cancellation-policies/${policy.id}/edit`}
                    className="p-2 rounded-lg text-stone-light hover:text-charcoal hover:bg-cream transition-all"
                    title="Edit policy"
                  >
                    <Pencil size={14} />
                  </Link>
                  <DeletePolicyButton
                    policyId={policy.id}
                    policyName={policy.name}
                    propertyCount={policy._count.properties}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
