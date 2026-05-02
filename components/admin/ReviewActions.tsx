"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2, MessageSquare, Loader2, X, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ApproveReviewButton({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      toast.success("Review approved");
      router.refresh();
    } catch {
      toast.error("Failed to approve review.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer"
    >
      {loading ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
      Approve
    </button>
  );
}

export function RejectReviewButton({ reviewId, guestName }: { reviewId: string; guestName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (!window.confirm(`Reject and delete ${guestName}'s review? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to reject");
      toast.success("Review rejected and deleted");
      router.refresh();
    } catch {
      toast.error("Failed to reject review.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
    >
      {loading ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
      Reject
    </button>
  );
}

export function HostResponseButton({
  reviewId,
  existingResponse,
}: {
  reviewId: string;
  existingResponse?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [text, setText]       = useState(existingResponse ?? "");
  const [saving, setSaving]   = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostResponse: text.trim() || null }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success(text.trim() ? "Response saved" : "Response removed");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to save response.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={() => { setText(existingResponse ?? ""); setOpen(true); }}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
          existingResponse
            ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
            : "bg-cream border border-warm-border text-stone hover:text-charcoal hover:bg-[#F0EFE9]"
        )}
      >
        <MessageSquare size={11} />
        {existingResponse ? "Edit response" : "Add response"}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-charcoal">Host Response</h3>
              <button onClick={() => setOpen(false)} className="text-stone-light hover:text-charcoal transition-colors">
                <X size={16} />
              </button>
            </div>
            <textarea
              autoFocus
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
              placeholder="Write your response to the guest's review…"
              className="w-full px-4 py-3 text-sm rounded-xl border border-warm-border bg-cream text-charcoal placeholder:text-stone-light/50 focus:outline-none focus:ring-2 focus:ring-sand/40 resize-none leading-relaxed mb-1"
            />
            <div className="flex items-center justify-between mb-4">
              <span className={cn("text-[10px]", text.length > 950 ? "text-amber-500" : "text-stone-light")}>
                {text.length}/1000
              </span>
              {existingResponse && (
                <button
                  onClick={() => setText("")}
                  className="text-[11px] text-stone-light hover:text-red-500 transition-colors"
                >
                  Remove response
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-sand text-white text-sm font-semibold rounded-full disabled:opacity-50 hover:bg-sand-dark transition-colors"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                Save response
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 border border-warm-border text-stone text-sm rounded-full hover:bg-cream transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
