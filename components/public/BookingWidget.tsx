"use client";

import { useMemo, useContext } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Users, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PropertyDateContext } from "@/components/public/PropertyCalendar";

interface BookingWidgetProps {
  propertyId: string;
  nightlyRate: number;
}

function parseLocal(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplay(str: string): string {
  return parseLocal(str).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookingWidget({
  propertyId,
  nightlyRate,
}: BookingWidgetProps) {
  const router = useRouter();
  const { checkIn, checkOut, clearDates } = useContext(PropertyDateContext);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff =
      (parseLocal(checkOut).getTime() - parseLocal(checkIn).getTime()) /
      86400000;
    return diff > 0 ? Math.round(diff) : 0;
  }, [checkIn, checkOut]);

  const total = useMemo(() => nights * nightlyRate, [nights, nightlyRate]);

  function handleBook() {
    if (!checkIn || !checkOut || nights <= 0) return;
    router.push(
      `/checkout?propertyId=${propertyId}&checkIn=${checkIn}&checkOut=${checkOut}&totalNights=${nights}&totalAmount=${total}`
    );
  }

  const canBook = checkIn && checkOut && nights > 0;

  return (
    <div className="bg-surface border border-warm-border rounded-[var(--radius-card)] shadow-lg p-6 sticky top-24">
      {/* Rate */}
      <div className="flex items-baseline gap-1 mb-5">
        <span className="font-serif text-3xl font-semibold text-charcoal">
          ${nightlyRate.toLocaleString()}
        </span>
        <span className="text-stone text-sm">/ night</span>
      </div>

      {/* Selected dates summary */}
      {checkIn || checkOut ? (
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2">
            <div
              className={cn(
                "border rounded-lg px-3 py-2.5",
                checkIn ? "border-sand bg-cream" : "border-warm-border bg-cream"
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-light mb-0.5">
                Check-in
              </p>
              <p className={cn("text-sm font-medium", checkIn ? "text-charcoal" : "text-stone-light")}>
                {checkIn ? formatDisplay(checkIn) : "—"}
              </p>
            </div>
            <div
              className={cn(
                "border rounded-lg px-3 py-2.5",
                checkOut ? "border-sand bg-cream" : "border-warm-border bg-cream"
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-light mb-0.5">
                Check-out
              </p>
              <p className={cn("text-sm font-medium", checkOut ? "text-charcoal" : "text-stone-light")}>
                {checkOut ? formatDisplay(checkOut) : "—"}
              </p>
            </div>
          </div>

          {/* Clear dates */}
          <button
            type="button"
            onClick={clearDates}
            className="flex items-center gap-1 mt-2 text-xs text-stone hover:text-sand transition-colors"
          >
            <X size={11} />
            Clear dates
          </button>
        </div>
      ) : (
        /* Prompt to use calendar */
        <div className="flex items-start gap-2 bg-cream border border-warm-border rounded-lg px-3 py-3 mb-4 text-xs text-stone leading-relaxed">
          <CalendarDays size={13} className="mt-0.5 shrink-0 text-sand" />
          <span>Select your dates on the calendar below to see pricing.</span>
        </div>
      )}

      {/* Price breakdown */}
      {canBook && (
        <div className="bg-cream rounded-lg px-4 py-3 mb-4 space-y-2 text-sm">
          <div className="flex justify-between text-stone">
            <span>
              ${nightlyRate.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}
            </span>
            <span className="text-charcoal font-medium">${total.toLocaleString()}</span>
          </div>
          <div className="border-t border-warm-border pt-2 flex justify-between font-semibold text-charcoal">
            <span>Total</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Incomplete selection hint */}
      {checkIn && !checkOut && (
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 mb-4">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          <span>Now select a check-out date on the calendar.</span>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleBook}
        disabled={!canBook}
        className={cn(
          "w-full py-3.5 rounded-full text-sm font-semibold transition-all duration-200",
          canBook
            ? "bg-sand hover:bg-sand-dark text-white hover:shadow-lg hover:shadow-sand/20 active:scale-[0.98]"
            : "bg-stone-light/30 text-stone-light cursor-not-allowed"
        )}
      >
        {canBook ? "Book Now" : "Select Dates to Book"}
      </button>

      {canBook && (
        <p className="text-center text-xs text-stone mt-3">
          {formatDisplay(checkIn)} → {formatDisplay(checkOut)} · {nights} night
          {nights > 1 ? "s" : ""}
        </p>
      )}

      {/* Guarantee note */}
      <div className="mt-4 pt-4 border-t border-warm-border flex items-center justify-center gap-1.5 text-xs text-stone">
        <Users size={12} />
        <span>Secure checkout · No booking fees</span>
      </div>
    </div>
  );
}
