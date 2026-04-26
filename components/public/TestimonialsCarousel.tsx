"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  guestName: string;
  guestLocation: string | null;
  rating: number;
  comment: string;
  reviewDate: string;
  propertyName: string;
}

interface Props {
  reviews: Review[];
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 mb-3">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={13}
          className={i < rating ? "fill-amber-400 text-amber-400" : "text-white/20"}
        />
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

export default function TestimonialsCarousel({ reviews }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const CARD_W = 320;
  const GAP = 16;

  function updateNav() {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateNav();
    el.addEventListener("scroll", updateNav, { passive: true });
    return () => el.removeEventListener("scroll", updateNav);
  }, []);

  function scrollTo(index: number) {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(reviews.length - 1, index));
    setActiveIndex(clamped);
    el.scrollTo({ left: clamped * (CARD_W + GAP), behavior: "smooth" });
  }

  return (
    <div className="relative">
      {/* Scroll track */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
        onScroll={updateNav}
      >
        {reviews.map((review) => (
          <div
            key={review.id}
            className="shrink-0 w-80 snap-start bg-white/8 border border-white/10 rounded-2xl p-6 flex flex-col"
          >
            <Stars rating={review.rating} />
            <p className="text-white/85 text-sm leading-relaxed flex-1 mb-5">
              &ldquo;{truncate(review.comment, 200)}&rdquo;
            </p>
            <div>
              <p className="text-white font-semibold text-sm">{review.guestName}</p>
              {review.guestLocation && (
                <p className="text-white/40 text-xs mt-0.5">{review.guestLocation}</p>
              )}
              <p className="text-sand/70 text-[11px] mt-1 font-medium">{review.propertyName}</p>
              <p className="text-white/30 text-[11px] mt-0.5">{formatDate(review.reviewDate)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-5">
        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to review ${i + 1}`}
              className={cn(
                "rounded-full transition-all cursor-pointer",
                i === activeIndex
                  ? "w-5 h-1.5 bg-sand"
                  : "w-1.5 h-1.5 bg-white/25 hover:bg-white/50"
              )}
            />
          ))}
        </div>

        {/* Prev / Next */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollTo(activeIndex - 1)}
            disabled={!canPrev}
            aria-label="Previous review"
            className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scrollTo(activeIndex + 1)}
            disabled={!canNext}
            aria-label="Next review"
            className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
