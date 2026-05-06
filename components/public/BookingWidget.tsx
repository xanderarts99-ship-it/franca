"use client";

import { useMemo, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Users, AlertCircle, X, Loader2, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";
import { PropertyDateContext } from "@/components/public/PropertyCalendar";

interface PricingResult {
  nightlyTotal: number;
  nightlyBreakdown: { date: string; price: number }[];
  cleaningFee: number;
  petFee: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  hasCustomPricing: boolean;
  nights: number;
}

interface BookingWidgetProps {
  propertyId: string;
  nightlyRate: number;
  petsAllowed: boolean;
  petFee: number | null;
}

function parseLocal(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplay(str: string): string {
  return parseLocal(str).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function groupBreakdown(breakdown: { date: string; price: number }[]): { price: number; count: number }[] {
  const groups: { price: number; count: number }[] = [];
  for (const item of breakdown) {
    const last = groups[groups.length - 1];
    if (last && last.price === item.price) last.count++;
    else groups.push({ price: item.price, count: 1 });
  }
  return groups;
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand focus-visible:ring-offset-2",
        checked ? "bg-sand" : "bg-stone-light/40"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

export default function BookingWidget({ propertyId, nightlyRate, petsAllowed, petFee }: BookingWidgetProps) {
  const router = useRouter();
  const { checkIn, checkOut, clearDates } = useContext(PropertyDateContext);
  const [includePetFee, setIncludePetFee] = useState(false);

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

    const petParam = includePetFee ? "&includePetFee=true" : "";
    fetch(`/api/properties/${propertyId}/pricing?checkIn=${checkIn}&checkOut=${checkOut}${petParam}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("pricing failed");
        return res.json() as Promise<PricingResult>;
      })
      .then((data) => {
        if (!cancelled) { setPricing(data); setLoadingPricing(false); }
      })
      .catch(() => {
        if (!cancelled) { setPricingError(true); setLoadingPricing(false); }
      });

    return () => { cancelled = true; };
  }, [checkIn, checkOut, nights, propertyId, includePetFee]);

  const displayTotal = pricing?.totalAmount ?? (nights > 0 ? nights * nightlyRate : 0);

  function handleBook() {
    if (!checkIn || !checkOut || nights <= 0) return;
    const total = pricing?.totalAmount ?? nights * nightlyRate;
    setNavigating(true);
    const petParam = includePetFee ? "&includePetFee=true" : "";
    router.push(
      `/checkout?propertyId=${propertyId}&checkIn=${checkIn}&checkOut=${checkOut}&totalNights=${nights}&totalAmount=${total}${petParam}`
    );
  }

  const canBook = checkIn && checkOut && nights > 0 && !loadingPricing && !navigating;
  const showPetFeeToggle = petsAllowed && petFee != null && petFee > 0;
  const showPetsWelcome = petsAllowed && !showPetFeeToggle;

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
            <div className={cn("border rounded-lg px-3 py-2.5", checkIn ? "border-sand bg-cream" : "border-warm-border bg-cream")}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-light mb-0.5">Check-in</p>
              <p className={cn("text-sm font-medium", checkIn ? "text-charcoal" : "text-stone-light")}>
                {checkIn ? formatDisplay(checkIn) : "—"}
              </p>
            </div>
            <div className={cn("border rounded-lg px-3 py-2.5", checkOut ? "border-sand bg-cream" : "border-warm-border bg-cream")}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-light mb-0.5">Check-out</p>
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
                    <span>${g.price.toLocaleString()} × {g.count} night{g.count > 1 ? "s" : ""}</span>
                    <span className="text-charcoal font-medium">${(g.price * g.count).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between text-stone">
                  <span>${nightlyRate.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}</span>
                  <span className="text-charcoal font-medium">${pricing.nightlyTotal.toLocaleString()}</span>
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
              {pricing.petFee > 0 && (
                <div className="flex justify-between text-stone">
                  <span className="flex items-center gap-1.5">
                    <PawPrint size={12} className="text-stone-light" />
                    Pet fee
                  </span>
                  <span className="text-charcoal font-medium">
                    ${pricing.petFee.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

      {/* Pet fee toggle — petsAllowed AND a fee is configured */}
      {showPetFeeToggle && (
        <div className="border border-warm-border rounded-xl px-4 py-3.5 mb-4 bg-cream/50">
          <div className="flex items-center gap-2 mb-1">
            <PawPrint size={14} className="text-sand shrink-0" />
            <span className="text-sm font-semibold text-charcoal">Bringing a pet?</span>
          </div>
          <p className="text-xs text-stone leading-relaxed mb-3">
            A one-time pet fee of ${petFee} applies per stay, regardless of the number of pets.
          </p>
          <div className="flex items-center justify-between">
            <label className="text-sm text-stone cursor-pointer">
              Yes, I&apos;m bringing a pet
            </label>
            <ToggleSwitch checked={includePetFee} onChange={setIncludePetFee} />
          </div>
          {includePetFee && (
            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-sand font-medium">
              <PawPrint size={11} />
              <span>Pet fee added to your total</span>
            </div>
          )}
        </div>
      )}

      {/* Pets welcome notice — petsAllowed but no fee configured */}
      {showPetsWelcome && (
        <div className="flex items-center gap-2.5 border border-warm-border rounded-xl px-4 py-3 mb-4 bg-cream/50">
          <PawPrint size={14} className="text-sand shrink-0" />
          <div>
            <p className="text-sm font-semibold text-charcoal">Pets welcome</p>
            <p className="text-xs text-stone mt-0.5">No additional pet fee for this property.</p>
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
