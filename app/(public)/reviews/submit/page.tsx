"use client";

import { useState, useEffect } from "react";
import { Star, Loader2, Send, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

interface BookingInfo {
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="p-1 cursor-pointer"
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
        >
          <Star
            size={32}
            className={cn(
              "transition-colors",
              (hovered || value) >= star
                ? "fill-amber-400 text-amber-400"
                : "text-stone-light/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSubmitPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "invalid" | "already_submitted" | "ready">("loading");

  const [guestName, setGuestName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoadState("invalid");
      return;
    }

    fetch(`/api/reviews/validate?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (res.status === 404) { setLoadState("invalid"); return; }
        if (res.status === 409) { setLoadState("already_submitted"); return; }
        if (!res.ok) { setLoadState("invalid"); return; }
        const data = await res.json() as BookingInfo;
        setBookingInfo(data);
        setGuestName(data.guestName);
        setLoadState("ready");
      })
      .catch(() => setLoadState("invalid"));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Please select a star rating."); return; }
    if (comment.trim().length < 10) { setError("Please write at least 10 characters."); return; }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, guestName, rating, comment }),
      });

      if (!res.ok) {
        const json = await res.json() as { error?: string };
        setError(json.error ?? "Submission failed. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadState === "loading") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-sand" />
      </div>
    );
  }

  if (loadState === "invalid") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-semibold text-charcoal mb-2">
            Invalid Review Link
          </h1>
          <p className="text-stone text-sm leading-relaxed">
            This review link is invalid or has expired. If you believe this is an error,
            please contact us directly.
          </p>
        </div>
      </div>
    );
  }

  if (loadState === "already_submitted") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-semibold text-charcoal mb-2">
            Already Submitted
          </h1>
          <p className="text-stone text-sm leading-relaxed">
            You have already submitted a review. Thank you for your feedback!
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-semibold text-charcoal mb-2">
            Thank you!
          </h1>
          <p className="text-stone text-sm leading-relaxed">
            Thank you for your review! It will appear on our site after a short review process.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-16 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-semibold text-charcoal mb-2">
            Leave a Review
          </h1>
          {bookingInfo && (
            <p className="text-stone text-sm">
              {bookingInfo.propertyName} · {bookingInfo.checkIn} — {bookingInfo.checkOut}
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-surface border border-warm-border rounded-card p-6 space-y-5"
        >
          {/* Guest name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone">
              Your name
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              maxLength={100}
              required
              className="w-full px-4 py-3 text-sm rounded-xl border border-warm-border bg-cream text-charcoal focus:outline-none focus:ring-2 focus:ring-sand/40 focus:border-transparent"
            />
          </div>

          {/* Star rating */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone">
              Your rating
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Comment */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone">
                Your review
              </label>
              <span className="text-[11px] text-stone-light">
                {comment.length}/1000
              </span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              minLength={10}
              maxLength={1000}
              required
              placeholder="Tell future guests about your stay…"
              className="w-full px-4 py-3 text-sm rounded-xl border border-warm-border bg-cream text-charcoal resize-none focus:outline-none focus:ring-2 focus:ring-sand/40 focus:border-transparent placeholder:text-stone-light/50"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-full bg-sand hover:bg-sand-dark text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-sand/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send size={14} />
                Submit Review
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
