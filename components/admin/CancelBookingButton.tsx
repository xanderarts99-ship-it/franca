"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle, AlertTriangle, Loader2 } from "lucide-react";

interface Props {
  bookingId: string;
  bookingReference: string;
}

export default function CancelBookingButton({ bookingId, bookingReference }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCancel() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
        method: "POST",
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Failed to cancel booking. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold transition-all"
      >
        <XCircle size={14} />
        Cancel booking
      </button>

      {/* Modal backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => !loading && setOpen(false)}
        >
          <div
            className="bg-white rounded-[var(--radius-card)] shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 border border-red-100 mb-4 mx-auto">
              <AlertTriangle size={22} className="text-red-500" />
            </div>

            <h3 className="font-serif text-lg font-semibold text-charcoal text-center mb-1">
              Cancel this booking?
            </h3>
            <p className="text-sm text-stone text-center leading-relaxed mb-1">
              You are about to cancel{" "}
              <span className="font-mono font-semibold text-charcoal text-xs">
                {bookingReference}
              </span>
              .
            </p>
            <p className="text-xs text-stone-light text-center mb-5">
              The dates will be freed immediately. Refunds must be issued manually via Stripe.
            </p>

            {error && (
              <p className="text-xs text-red-500 text-center mb-4">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 py-2.5 rounded-full border border-warm-border text-charcoal text-sm font-semibold hover:bg-[#FAFAF7] transition-all disabled:opacity-50"
              >
                Keep booking
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Cancelling…
                  </>
                ) : (
                  "Yes, cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
