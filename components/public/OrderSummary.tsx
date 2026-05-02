import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";

interface NightBreakdown {
  date: string;
  price: number;
}

interface OrderSummaryProps {
  propertyName: string;
  location: string;
  image?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  nightlyRate: number;
  nightlyTotal: number;
  cleaningFee: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  hasCustomPricing: boolean;
  nightlyBreakdown: NightBreakdown[];
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function groupBreakdown(breakdown: NightBreakdown[]): { price: number; count: number }[] {
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

export default function OrderSummary({
  propertyName,
  location,
  image,
  checkIn,
  checkOut,
  nights,
  nightlyRate,
  nightlyTotal,
  cleaningFee,
  taxRate,
  taxAmount,
  total,
  hasCustomPricing,
  nightlyBreakdown,
}: OrderSummaryProps) {
  const taxPct = Math.round(taxRate * 100);

  return (
    <div className="bg-surface border border-warm-border rounded-card overflow-hidden sticky top-24">
      {/* Property image */}
      <div className="relative h-40 w-full">
        {image ? (
          <Image
            src={image}
            alt={propertyName}
            fill
            className="object-cover"
            sizes="340px"
          />
        ) : (
          <div
            className="h-full w-full flex items-center justify-center"
            style={{ background: "linear-gradient(160deg, #0F2945 0%, #1B3A6B 50%, #C8834A 100%)" }}
          >
            <span className="font-serif text-white/30 text-4xl font-semibold">RV</span>
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Property name */}
        <h3 className="font-serif text-lg font-semibold text-charcoal leading-tight">
          {propertyName}
        </h3>
        <div className="flex items-center gap-1.5 mt-1 mb-4">
          <MapPin size={12} className="text-stone-light shrink-0" />
          <span className="text-xs text-stone">{location}</span>
        </div>

        {/* Dates */}
        <div className="bg-cream rounded-xl p-3.5 mb-4 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <CalendarDays size={13} className="text-stone-light mt-0.5 shrink-0" />
            <div className="text-xs">
              <p className="text-stone-light uppercase tracking-wider font-medium mb-0.5">Check-in</p>
              <p className="text-charcoal font-medium">{formatDate(checkIn)}</p>
            </div>
          </div>
          <div className="border-t border-warm-border" />
          <div className="flex items-start gap-2.5">
            <CalendarDays size={13} className="text-stone-light mt-0.5 shrink-0" />
            <div className="text-xs">
              <p className="text-stone-light uppercase tracking-wider font-medium mb-0.5">Check-out</p>
              <p className="text-charcoal font-medium">{formatDate(checkOut)}</p>
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="space-y-2 text-sm border-t border-warm-border pt-4">
          {hasCustomPricing && nightlyBreakdown.length > 0 ? (
            groupBreakdown(nightlyBreakdown).map((g, i) => (
              <div key={i} className="flex justify-between text-stone">
                <span>${g.price.toLocaleString()} × {g.count} night{g.count > 1 ? "s" : ""}</span>
                <span className="text-charcoal">${fmt(g.price * g.count)}</span>
              </div>
            ))
          ) : (
            <div className="flex justify-between text-stone">
              <span>${nightlyRate.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}</span>
              <span className="text-charcoal">${fmt(nightlyTotal)}</span>
            </div>
          )}

          {cleaningFee > 0 && (
            <div className="flex justify-between text-stone">
              <span>Cleaning fee</span>
              <span className="text-charcoal">${fmt(cleaningFee)}</span>
            </div>
          )}

          {taxAmount > 0 && (
            <div className="flex justify-between text-stone">
              <span>Tax ({taxPct}%)</span>
              <span className="text-charcoal">${fmt(taxAmount)}</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-4 mt-2 border-t border-warm-border">
          <span className="font-semibold text-charcoal">Total</span>
          <div className="text-right">
            <span className="font-serif text-2xl font-semibold text-charcoal">
              ${fmt(total)}
            </span>
            <p className="text-xs text-stone">USD</p>
          </div>
        </div>
      </div>
    </div>
  );
}
