"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PolicyFormProps {
  mode: "create" | "edit";
  policyId?: string;
  defaultValues?: {
    name: string;
    policyText: string;
    fullRefundDays: number;
    partialRefundDays?: number | null;
    partialRefundPercentage?: number | null;
    isDefault: boolean;
  };
}

const INPUT_BASE =
  "w-full px-4 py-3 text-sm rounded-xl border border-warm-border bg-cream text-charcoal placeholder:text-stone-light/50 focus:outline-none focus:ring-2 focus:ring-sand/40 focus:border-transparent transition-all";

function Field({
  label, error, hint, children,
}: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-stone">{label}</label>
      {children}
      {hint && !error && <p className="text-[11px] text-stone-light">{hint}</p>}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1.5">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  );
}

export default function PolicyForm({ mode, policyId, defaultValues }: PolicyFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [name, setName]             = useState(defaultValues?.name ?? "");
  const [policyText, setPolicyText] = useState(defaultValues?.policyText ?? "");
  const [fullRefundDays, setFullRefundDays] = useState(
    String(defaultValues?.fullRefundDays ?? 7)
  );
  const [partialRefundDays, setPartialRefundDays]           = useState(
    String(defaultValues?.partialRefundDays ?? "")
  );
  const [partialRefundPercentage, setPartialRefundPercentage] = useState(
    String(defaultValues?.partialRefundPercentage ?? "")
  );
  const [isDefault, setIsDefault] = useState(defaultValues?.isDefault ?? false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!policyText.trim()) errs.policyText = "Policy text is required";
    const frd = Number(fullRefundDays);
    if (isNaN(frd) || frd < 0) errs.fullRefundDays = "Must be 0 or more";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    const body = {
      name: name.trim(),
      policyText: policyText.trim(),
      fullRefundDays: Number(fullRefundDays),
      partialRefundDays: partialRefundDays ? Number(partialRefundDays) : null,
      partialRefundPercentage: partialRefundPercentage ? Number(partialRefundPercentage) : null,
      isDefault,
    };

    setSubmitting(true);
    try {
      const url  = mode === "create"
        ? "/api/admin/cancellation-policies"
        : `/api/admin/cancellation-policies/${policyId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(json.error ?? "Failed to save policy");
      }

      toast.success(mode === "create" ? "Policy created" : "Policy updated");
      router.push("/admin/cancellation-policies");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="bg-white border border-warm-border rounded-card p-6 space-y-4">

        <Field label="Policy name" error={errors.name}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Flexible, Moderate, Strict"
            className={cn(INPUT_BASE, errors.name && "border-red-300 focus:ring-red-300")}
          />
        </Field>

        <Field
          label="Policy text"
          error={errors.policyText}
          hint="This is shown to guests on the property page and at checkout."
        >
          <div className="relative">
            <textarea
              rows={5}
              value={policyText}
              onChange={(e) => setPolicyText(e.target.value)}
              placeholder="Describe the cancellation terms in plain language…"
              className={cn(
                INPUT_BASE, "resize-none leading-relaxed pb-7",
                errors.policyText && "border-red-300 focus:ring-red-300"
              )}
            />
            <span className={cn(
              "absolute bottom-2.5 right-3 text-[10px]",
              policyText.length > 450 ? "text-amber-500" : "text-stone-light"
            )}>
              {policyText.length}/500
            </span>
          </div>
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field
            label="Full refund before (days)"
            error={errors.fullRefundDays}
            hint="Days before check-in for a 100% refund"
          >
            <input
              type="number"
              min={0}
              step={1}
              value={fullRefundDays}
              onChange={(e) => setFullRefundDays(e.target.value)}
              className={cn(INPUT_BASE, errors.fullRefundDays && "border-red-300 focus:ring-red-300")}
            />
          </Field>
          <Field
            label="Partial refund before (days)"
            hint="Leave blank if no partial refund"
          >
            <input
              type="number"
              min={0}
              step={1}
              value={partialRefundDays}
              onChange={(e) => setPartialRefundDays(e.target.value)}
              placeholder="—"
              className={INPUT_BASE}
            />
          </Field>
          <Field
            label="Partial refund %"
            hint="e.g. 50 for 50% back"
          >
            <input
              type="number"
              min={1}
              max={99}
              step={1}
              value={partialRefundPercentage}
              onChange={(e) => setPartialRefundPercentage(e.target.value)}
              placeholder="—"
              className={INPUT_BASE}
            />
          </Field>
        </div>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-4 h-4 rounded border-warm-border accent-sand cursor-pointer"
          />
          <span className="text-sm text-stone group-hover:text-charcoal transition-colors">
            Set as default policy for new properties
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={submitting}
          className="px-5 py-2.5 rounded-full border border-warm-border text-stone text-sm font-medium hover:bg-cream transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-sand text-white text-sm font-semibold hover:bg-sand-dark transition-all hover:shadow-md hover:shadow-sand/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <><Loader2 size={13} className="animate-spin" /> Saving…</>
          ) : (
            <><Save size={13} /> {mode === "create" ? "Create policy" : "Save changes"}</>
          )}
        </button>
      </div>
    </form>
  );
}
