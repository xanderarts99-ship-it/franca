"use client";

import { useMemo, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Users, AlertCircle, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PropertyDateContext } from "@/components/public/PropertyCalendar";

interface PricingResult {
  nightlyTotal: number;
  nightlyBreakdown: { date: string; price: number }[];
  cleaningFee: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  hasCustomPricing: boolean;
  nights: number;
}

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

function groupBreakdown(
  breakdown: { date: string; price: number }[]
): { price: number; count: number }[] {
  const groups: { price: number; count: number }[] = [];
  for (const item of breakdown) {
    const last = groups[groups.length - 1];
    if (last && last.price === item.price) {
      last.count++;
    } else {
      groups.push({ price: item.price, count: 1 });
    }
  }
  return groups;
}

export default function BookingWidget({ propertyId, nightlyRate }: BookingWidgetProps) {
  const router = useRouter();
  const { checkIn, checkOut, clearDates } = useContext(PropertyDateContext);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = (parseLocal(checkOut).getTime() - parseLocal(checkIn).getTime()) / 86400000;
    return diff > 0 ? Math.round(diff) : 0;
  }, [checkIn, checkOut]);

  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [pricingError, setPricingError] = useState(false);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    if (!checkIn || !checkOut || nights <= 0) {
      setPricing(null);
      return;
    }

    let cancelled = false;
    setLoadingPricing(true);
    setPricingError(false);

    fetch(`/api/properties/${propertyId}/pricing?checkIn=${checkIn}&checkOut=${checkOut}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("pricing failed");
        return res.json() as Promise<PricingResult>;
      })
      .then((data) => {
        if (!cancelled) {
          setPricing(data);
          setLoadingPricing(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPricingError(true);
          setLoadingPricing(false);
        }
      });

    return () => { cancelled = true; };
  }, [checkIn, checkOut, nights, propertyId]);

  const displayTotal = pricing?.totalAmount ?? (nights > 0 ? nights * nightlyRate : 0);

  function handleBook() {
    if (!checkIn || !checkOut || nights <= 0) return;
    const total = pricing?.totalAmount ?? nights * nightlyRate;
    setNavigating(true);
    router.push(
      `/checkout?propertyId=${propertyId}&checkIn=${checkIn}&checkOut=${checkOut}&totalNights=${nights}&totalAmount=${total}`
    );
  }

  const canBook = checkIn && checkOut && nights > 0 && !loadingPricing && !navigating;

  return (
    <div className="bg-surface border border-warm-border rounded-card shadow-lg p-6 sticky top-24">
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
        <div className="flex items-start gap-2 bg-cream border border-warm-border rounded-lg px-3 py-3 mb-4 text-xs text-stone leading-relaxed">
          <CalendarDays size={13} className="mt-0.5 shrink-0 text-sand" />
          <span>Select your dates on the calendar below to see pricing.</span>
        </div>
      )}

      {/* Price breakdown */}
      {nights > 0 && (
        <div className="bg-cream rounded-lg px-4 py-3 mb-4 space-y-2 text-sm">
          {loadingPricing ? (
            <div className="flex items-center justify-center gap-2 py-2 text-stone">
              <Loader2 size={13} className="animate-spin" />
              <span className="text-xs">Calculating…</span>
            </div>
          ) : pricingError ? (
            <>
              <div className="flex justify-between text-stone">
                <span>${nightlyRate.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}</span>
                <span className="text-charcoal font-medium">${(nights * nightlyRate).toLocaleString()}</span>
              </div>
              <div className="border-t border-warm-border pt-2 flex justify-between font-semibold text-charcoal">
                <span>Total</span>
                <span>${(nights * nightlyRate).toLocaleString()}</span>
              </div>
            </>
          ) : pricing ? (
            <>
              {pricing.hasCustomPricing ? (
                groupBreakdown(pricing.nightlyBreakdown).map((g, i) => (
                  <div key={i} className="flex justify-between text-stone">
                    <span>
                      ${g.price.toLocaleString()} × {g.count} night{g.count > 1 ? "s" : ""}
                    </span>
                    <span className="text-charcoal font-medium">
                      ${(g.price * g.count).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-stone">
                  <span>
                    ${nightlyRate.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}
                  </span>
                  <span className="text-charcoal font-medium">
                    ${pricing.nightlyTotal.toLocaleString()}
                  </span>
                </div>
              )}

              {pricing.cleaningFee > 0 && (
                <div className="flex justify-between text-stone">
                  <span>Cleaning fee</span>
                  <span className="text-charcoal font-medium">
                    ${pricing.cleaningFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {pricing.taxAmount > 0 && (
                <div className="flex justify-between text-stone">
                  <span>Tax ({Math.round(pricing.taxRate * 100)}%)</span>
                  <span className="text-charcoal font-medium">
                    ${pricing.taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="border-t border-warm-border pt-2 flex justify-between font-semibold text-charcoal">
                <span>Total</span>
                <span>${pricing.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </>
          ) : null}
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
        {loadingPricing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            Calculating…
          </span>
        ) : navigating ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            Loading…
          </span>
        ) : canBook ? "Book Now" : "Select Dates to Book"}
      </button>

      {checkIn && checkOut && nights > 0 && (
        <p className="text-center text-xs text-stone mt-3">
          {formatDisplay(checkIn)} → {formatDisplay(checkOut)} · {nights} night{nights > 1 ? "s" : ""}
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-warm-border flex items-center justify-center gap-1.5 text-xs text-stone">
        <Users size={12} />
        <span>Secure checkout · No booking fees</span>
      </div>
    </div>
  );
}
