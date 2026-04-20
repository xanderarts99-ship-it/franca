import Image from "next/image";
import { CalendarDays, MapPin, Tag } from "lucide-react";

interface OrderSummaryProps {
  propertyName: string;
  location: string;
  image?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  nightlyRate: number;
  total: number;
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

export default function OrderSummary({
  propertyName,
  location,
  image,
  checkIn,
  checkOut,
  nights,
  nightlyRate,
  total,
}: OrderSummaryProps) {
  return (
    <div className="bg-surface border border-warm-border rounded-[var(--radius-card)] overflow-hidden sticky top-24">
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
          <MapPin size={12} className="text-stone-light flex-shrink-0" />
          <span className="text-xs text-stone">{location}</span>
        </div>

        {/* Dates */}
        <div className="bg-cream rounded-xl p-3.5 mb-4 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <CalendarDays size={13} className="text-stone-light mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="text-stone-light uppercase tracking-wider font-medium mb-0.5">
                Check-in
              </p>
              <p className="text-charcoal font-medium">{formatDate(checkIn)}</p>
            </div>
          </div>
          <div className="border-t border-warm-border" />
          <div className="flex items-start gap-2.5">
            <CalendarDays size={13} className="text-stone-light mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="text-stone-light uppercase tracking-wider font-medium mb-0.5">
                Check-out
              </p>
              <p className="text-charcoal font-medium">{formatDate(checkOut)}</p>
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="space-y-2 text-sm border-t border-warm-border pt-4">
          <div className="flex justify-between text-stone">
            <span>
              ${nightlyRate.toLocaleString()} × {nights} night
              {nights > 1 ? "s" : ""}
            </span>
            <span className="text-charcoal">
              ${(nightlyRate * nights).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-stone">
            <div className="flex items-center gap-1.5">
              <Tag size={11} />
              Booking fee
            </div>
            <span className="text-emerald-600 font-medium text-xs">Free</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-4 mt-2 border-t border-warm-border">
          <span className="font-semibold text-charcoal">Total</span>
          <div className="text-right">
            <span className="font-serif text-2xl font-semibold text-charcoal">
              ${total.toLocaleString()}
            </span>
            <p className="text-xs text-stone">USD</p>
          </div>
        </div>
      </div>
    </div>
  );
}
