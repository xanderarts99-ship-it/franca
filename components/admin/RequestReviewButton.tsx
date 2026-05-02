"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2, RefreshCw, X, Send } from "lucide-react";
import { toast } from "sonner";

export default function RequestReviewButton({
  bookingId,
  alreadySent,
}: {
  bookingId: string;
  alreadySent: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/request-review`, {
        method: "POST",
      });
      const json = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to send review request");
      toast.success("Review request sent!");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message || "Failed to send review request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-warm-border text-stone text-sm font-medium hover:bg-cream hover:text-charcoal transition-all cursor-pointer"
      >
        {alreadySent ? <RefreshCw size={13} /> : <Star size={13} />}
        {alreadySent ? "Resend review request" : "Request review"}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => !loading && setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-sand/10 flex items-center justify-center">
                  {alreadySent ? (
                    <RefreshCw size={16} className="text-sand" />
                  ) : (
                    <Star size={16} className="text-sand" />
                  )}
                </div>
                <h3 className="font-serif text-lg font-semibold text-charcoal">
                  {alreadySent ? "Resend request?" : "Request review?"}
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="text-stone-light hover:text-charcoal transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-sm text-stone leading-relaxed mb-5">
              {alreadySent
                ? "A review request was already sent. This will send another email to the guest with the same review link."
                : "This will send an email to the guest with a link to leave a review for their stay."}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-sand text-white text-sm font-semibold rounded-full disabled:opacity-50 hover:bg-sand-dark transition-colors"
              >
                {loading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Send size={13} />
                )}
                {loading ? "Sending…" : "Send email"}
              </button>
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="px-4 py-2.5 border border-warm-border text-stone text-sm rounded-full hover:bg-cream transition-colors disabled:opacity-50"
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
