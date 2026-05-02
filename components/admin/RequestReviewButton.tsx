"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2, RefreshCw } from "lucide-react";
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

  async function handleRequest() {
    if (!window.confirm(
      alreadySent
        ? "Resend the review request email to this guest?"
        : "Send a review request email to this guest?"
    )) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/request-review`, {
        method: "POST",
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to send review request");
      toast.success("Review request sent!");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message || "Failed to send review request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRequest}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-warm-border text-stone text-sm font-medium hover:bg-cream hover:text-charcoal transition-all disabled:opacity-50 cursor-pointer"
    >
      {loading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : alreadySent ? (
        <RefreshCw size={13} />
      ) : (
        <Star size={13} />
      )}
      {alreadySent ? "Resend review request" : "Request review"}
    </button>
  );
}
