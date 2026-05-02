"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DeletePolicyButton({
  policyId,
  policyName,
  propertyCount,
}: {
  policyId: string;
  policyName: string;
  propertyCount: number;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (propertyCount > 0) {
      toast.error(`Cannot delete "${policyName}" — it is assigned to ${propertyCount} propert${propertyCount !== 1 ? "ies" : "y"}.`);
      return;
    }
    if (!window.confirm(`Delete "${policyName}"? This cannot be undone.`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/cancellation-policies/${policyId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(json.error ?? "Delete failed");
      }
      toast.success("Policy deleted");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message || "Failed to delete policy.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="p-2 rounded-lg text-stone-light hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50 cursor-pointer"
      title="Delete policy"
    >
      {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </button>
  );
}
