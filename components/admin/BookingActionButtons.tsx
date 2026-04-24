"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  DollarSign,
} from "lucide-react";

interface Props {
  bookingId: string;
  bookingReference: string;
  totalAmount: number;
  guestEmail: string;
}

export default function BookingActionButtons({
  bookingId,
  bookingReference,
  totalAmount,
  guestEmail,
}: Props) {
  const router = useRouter();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const [paymentNotes, setPaymentNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm", paymentNotes: paymentNotes || undefined }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Failed to confirm booking. Please try again.");
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

  async function handleReject() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", rejectionReason: rejectionReason || undefined }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Failed to reject booking. Please try again.");
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
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => { setError(""); setConfirmOpen(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all"
        >
          <CheckCircle2 size={14} />
          Confirm Payment Received
        </button>

        <button
          onClick={() => { setError(""); setRejectOpen(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold transition-all"
        >
          <XCircle size={14} />
          Reject Request
        </button>
      </div>

      {error && !confirmOpen && !rejectOpen && (
        <p className="text-xs text-red-500 mt-3">{error}</p>
      )}

      {/* ── Confirm modal ──────────────────────────────────────── */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => !loading && setConfirmOpen(false)}
        >
          <div
            className="bg-white rounded-[var(--radius-card)] shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 mb-4 mx-auto">
              <DollarSign size={22} className="text-emerald-600" />
            </div>

            <h3 className="font-serif text-lg font-semibold text-charcoal text-center mb-1">
              Confirm Payment Received
            </h3>
            <p className="text-sm text-stone text-center leading-relaxed mb-1">
              Booking{" "}
              <span className="font-mono font-semibold text-charcoal text-xs">
                {bookingReference}
              </span>
            </p>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-5 text-center">
              <p className="text-xs text-emerald-700 font-semibold mb-0.5">CONFIRM YOU RECEIVED</p>
              <p className="font-serif text-2xl font-semibold text-emerald-800">
                ${totalAmount.toLocaleString()}
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">from {guestEmail}</p>
            </div>

            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-4 leading-relaxed">
              Only confirm after you have received payment via the Stripe Payment Link.
            </p>

            <div className="mb-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone block mb-1.5">
                Payment notes (optional)
              </label>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="e.g. Payment link sent and confirmed via Stripe"
                rows={2}
                disabled={loading}
                className="w-full text-sm rounded-xl border border-warm-border bg-cream px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent resize-none placeholder:text-stone-light/60 text-charcoal"
              />
            </div>

            {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
                className="flex-1 py-2.5 rounded-full border border-warm-border text-charcoal text-sm font-semibold hover:bg-[#FAFAF7] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Confirming…
                  </>
                ) : (
                  "Confirm booking"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject modal ───────────────────────────────────────── */}
      {rejectOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => !loading && setRejectOpen(false)}
        >
          <div
            className="bg-white rounded-[var(--radius-card)] shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 border border-red-100 mb-4 mx-auto">
              <AlertTriangle size={22} className="text-red-500" />
            </div>

            <h3 className="font-serif text-lg font-semibold text-charcoal text-center mb-1">
              Reject this request?
            </h3>
            <p className="text-sm text-stone text-center leading-relaxed mb-5">
              This will cancel the booking request and notify the guest by email.
            </p>

            <div className="mb-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone block mb-1.5">
                Reason (optional — included in guest email)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Dates unavailable due to maintenance"
                rows={2}
                disabled={loading}
                className="w-full text-sm rounded-xl border border-warm-border bg-cream px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent resize-none placeholder:text-stone-light/60 text-charcoal"
              />
            </div>

            {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => setRejectOpen(false)}
                disabled={loading}
                className="flex-1 py-2.5 rounded-full border border-warm-border text-charcoal text-sm font-semibold hover:bg-[#FAFAF7] transition-all disabled:opacity-50"
              >
                Keep request
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="flex-1 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Rejecting…
                  </>
                ) : (
                  "Reject request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
