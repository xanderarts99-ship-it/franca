"use client";

import { useState } from "react";
import { Star, MapPin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  guestName: string;
  guestLocation: string | null;
  rating: number;
  comment: string;
  reviewDate: string;
  hostResponse?: string | null;
  hostResponseAt?: string | null;
}

interface Props {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-stone-light/30"}
        />
      ))}
    </span>
  );
}

function formatReviewDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function PropertyReviews({ reviews, averageRating, totalReviews }: Props) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? reviews : reviews.slice(0, 6);
  const hasMore = reviews.length > 6;

  if (totalReviews === 0) {
    return (
      <section className="py-8 border-t border-warm-border">
        <h2 className="font-serif text-2xl font-semibold text-charcoal mb-3">Guest Reviews</h2>
        <p className="text-sm text-stone-light">No reviews yet for this property.</p>
      </section>
    );
  }

  return (
    <section className="py-8 border-t border-warm-border">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <h2 className="font-serif text-2xl font-semibold text-charcoal">Guest Reviews</h2>
        <div className="flex items-center gap-2">
          <Stars rating={averageRating} size={16} />
          <span className="font-semibold text-charcoal text-sm">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-stone-light text-sm">
            · {totalReviews} review{totalReviews !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Review grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visible.map((review) => (
          <div
            key={review.id}
            className="bg-surface border border-warm-border rounded-xl overflow-hidden flex flex-col"
          >
            <div className="p-4 flex flex-col gap-3 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-charcoal text-sm truncate">{review.guestName}</p>
                  {review.guestLocation && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={10} className="text-stone-light shrink-0" />
                      <span className="text-xs text-stone-light">{review.guestLocation}</span>
                    </div>
                  )}
                </div>
                <Stars rating={review.rating} size={12} />
              </div>

              <p className="text-sm text-stone leading-relaxed flex-1 wrap-break-word">{review.comment}</p>

              <p className="text-[11px] text-stone-light">{formatReviewDate(review.reviewDate)}</p>
            </div>

            {review.hostResponse && (
              <div className="bg-[#F0F7F4] border-t border-warm-border px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1B4332] mb-1">
                  Response from Francisca
                  {review.hostResponseAt && (
                    <span className="font-normal ml-1 opacity-60">
                      — {formatReviewDate(review.hostResponseAt)}
                    </span>
                  )}
                </p>
                <p className="text-xs text-stone leading-relaxed">{review.hostResponse}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show all / collapse */}
      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "mt-5 flex items-center gap-2 text-sm font-semibold text-sand hover:text-sand-dark transition-colors cursor-pointer"
          )}
        >
          <ChevronDown
            size={15}
            className={cn("transition-transform", expanded && "rotate-180")}
          />
          {expanded
            ? "Show fewer reviews"
            : `Show all ${totalReviews} reviews`}
        </button>
      )}
    </section>
  );
}
