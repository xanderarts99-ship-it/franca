"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Users, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingWidgetProps {
  propertyId: string;
  nightlyRate: number;
  blockedDates?: string[]; // ISO date strings "YYYY-MM-DD"
}

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
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
  blockedDates = [],
}: BookingWidgetProps) {
  const router = useRouter();
  const today = toDateString(new Date());

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState("");

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff =
      (parseLocal(checkOut).getTime() - parseLocal(checkIn).getTime()) /
      (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  const total = nights * nightlyRate;

  const hasBlockedDateInRange = useMemo(() => {
    if (!checkIn || !checkOut || nights <= 0) return false;
    const start = parseLocal(checkIn).getTime();
    const end = parseLocal(checkOut).getTime();
    return blockedDates.some((d) => {
      const t = parseLocal(d).getTime();
      return t >= start && t < end;
    });
  }, [checkIn, checkOut, nights, blockedDates]);

  function handleCheckInChange(val: string) {
    setCheckIn(val);
    setError("");
    if (checkOut && val >= checkOut) setCheckOut("");
  }

  function handleCheckOutChange(val: string) {
    setCheckOut(val);
    setError("");
  }

  function handleBook() {
    if (!checkIn || !checkOut) {
      setError("Please select both check-in and check-out dates.");
      return;
    }
    if (nights <= 0) {
      setError("Check-out must be after check-in.");
      return;
    }
    if (hasBlockedDateInRange) {
      setError("Some dates in your range are unavailable. Please adjust your stay.");
      return;
    }
    router.push(
      `/checkout?propertyId=${propertyId}&checkIn=${checkIn}&checkOut=${checkOut}`
    );
  }

  return (
    <div className="bg-surface border border-warm-border rounded-[var(--radius-card)] shadow-lg p-6 sticky top-24">
      {/* Rate */}
      <div className="flex items-baseline gap-1 mb-5">
        <span className="font-serif text-3xl font-semibold text-charcoal">
          ${nightlyRate.toLocaleString()}
        </span>
        <span className="text-stone text-sm">/ night</span>
      </div>

      {/* Date inputs */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone">
            Check-in
          </label>
          <div className="relative">
            <CalendarDays
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-light pointer-events-none"
            />
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className={cn(
                "w-full pl-8 pr-2 py-2.5 text-sm border rounded-lg bg-cream focus:outline-none focus:ring-2 focus:ring-sand focus:border-transparent transition-all",
                checkIn ? "text-charcoal border-sand" : "text-stone border-warm-border"
              )}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone">
            Check-out
          </label>
          <div className="relative">
            <CalendarDays
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-light pointer-events-none"
            />
            <input
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => handleCheckOutChange(e.target.value)}
              className={cn(
                "w-full pl-8 pr-2 py-2.5 text-sm border rounded-lg bg-cream focus:outline-none focus:ring-2 focus:ring-sand focus:border-transparent transition-all",
                checkOut ? "text-charcoal border-sand" : "text-stone border-warm-border"
              )}
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 mb-3">
          <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Price breakdown */}
      {nights > 0 && !hasBlockedDateInRange && (
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

      {/* CTA */}
      <button
        onClick={handleBook}
        disabled={hasBlockedDateInRange}
        className={cn(
          "w-full py-3.5 rounded-full text-sm font-semibold transition-all duration-200",
          hasBlockedDateInRange
            ? "bg-stone-light text-white cursor-not-allowed"
            : "bg-sand hover:bg-sand-dark text-white hover:shadow-lg hover:shadow-sand/20 active:scale-[0.98]"
        )}
      >
        {nights > 0 ? "Book Now" : "Check Availability"}
      </button>

      {nights > 0 && (
        <p className="text-center text-xs text-stone mt-3">
          {formatDisplay(checkIn)} → {formatDisplay(checkOut)} · {nights} night{nights > 1 ? "s" : ""}
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
