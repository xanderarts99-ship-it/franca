import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  CalendarDays,
  MapPin,
  User,
  Mail,
  Phone,
  Hash,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Booking Confirmed",
};

/* ── Mock booking lookup (replace with DB query) ──────────────── */
interface MockBooking {
  bookingReference: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  propertyName: string;
  location: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  totalNights: number;
  nightlyRate: number;
  totalAmount: number;
}

const MOCK_BOOKINGS: Record<string, MockBooking> = {
  "booking-demo-1": {
    bookingReference: "VR-2026-000001",
    status: "PENDING",
    propertyName: "Oceanfront Villa",
    location: "Miami Beach, FL",
    guestName: "Jane Smith",
    guestEmail: "jane@example.com",
    guestPhone: "+1 (555) 000-0000",
    checkIn: "2026-08-01",
    checkOut: "2026-08-05",
    totalNights: 4,
    nightlyRate: 420,
    totalAmount: 1680,
  },
};

interface PageProps {
  searchParams: Promise<{ bookingId?: string }>;
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-warm-border last:border-0">
      <Icon size={14} className="text-stone-light mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-light mb-0.5">
          {label}
        </p>
        <p className="text-sm text-charcoal font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

export default async function BookingConfirmationPage({ searchParams }: PageProps) {
  const { bookingId } = await searchParams;

  if (!bookingId) redirect("/");

  const booking = MOCK_BOOKINGS[bookingId];
  if (!booking || booking.status === "CANCELLED") redirect("/");

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-20">

        {/* ── Success header ───────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 mb-5">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal mb-2">
            You&apos;re all set!
          </h1>
          <p className="text-stone text-sm leading-relaxed max-w-sm mx-auto">
            Your booking is confirmed. A confirmation email has been sent to{" "}
            <span className="text-charcoal font-medium">{booking.guestEmail}</span>.
          </p>
        </div>

        {/* ── Booking reference card ───────────────────────────── */}
        <div className="bg-surface border border-warm-border rounded-[var(--radius-card)] overflow-hidden mb-4">

          {/* Property gradient banner */}
          <div
            className="h-32 w-full relative"
            style={{
              background:
                "linear-gradient(160deg, #0F2945 0%, #1B3A6B 50%, #C8834A 100%)",
            }}
          >
            <div className="h-full w-full bg-black/20 flex flex-col items-center justify-center gap-1">
              <span className="font-serif text-white/30 text-3xl font-semibold">RV</span>
            </div>

            {/* Reference badge overlay */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
              <div className="bg-surface border border-warm-border rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm">
                <Hash size={11} className="text-sand" />
                <span className="font-mono text-xs font-semibold text-charcoal tracking-wider">
                  {booking.bookingReference}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 pt-8">
            {/* Property info */}
            <div className="text-center mb-6">
              <h2 className="font-serif text-xl font-semibold text-charcoal">
                {booking.propertyName}
              </h2>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <MapPin size={11} className="text-stone-light" />
                <span className="text-xs text-stone">{booking.location}</span>
              </div>
            </div>

            {/* Stay dates — prominent */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-cream rounded-xl p-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <CalendarDays size={11} className="text-stone-light" />
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-light">
                    Check-in
                  </p>
                </div>
                <p className="text-sm font-semibold text-charcoal leading-snug">
                  {formatDate(booking.checkIn)}
                </p>
              </div>
              <div className="bg-cream rounded-xl p-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <CalendarDays size={11} className="text-stone-light" />
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-light">
                    Check-out
                  </p>
                </div>
                <p className="text-sm font-semibold text-charcoal leading-snug">
                  {formatDate(booking.checkOut)}
                </p>
              </div>
            </div>

            {/* Guest details */}
            <div className="mb-6">
              <DetailRow icon={User} label="Guest name" value={booking.guestName} />
              <DetailRow icon={Mail} label="Email" value={booking.guestEmail} />
              <DetailRow icon={Phone} label="Phone" value={booking.guestPhone} />
            </div>

            {/* Price summary */}
            <div className="bg-cream rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm text-stone">
                <span>
                  ${booking.nightlyRate.toLocaleString()} × {booking.totalNights} night
                  {booking.totalNights > 1 ? "s" : ""}
                </span>
                <span className="text-charcoal">
                  ${(booking.nightlyRate * booking.totalNights).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm text-stone">
                <span>Booking fee</span>
                <span className="text-emerald-600 font-medium text-xs">Free</span>
              </div>
              <div className="flex justify-between items-center pt-2 mt-1 border-t border-warm-border">
                <span className="font-semibold text-charcoal text-sm">Total charged</span>
                <span className="font-serif text-2xl font-semibold text-charcoal">
                  ${booking.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Status note ──────────────────────────────────────── */}
        {booking.status === "PENDING" && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4 text-xs text-amber-700 leading-relaxed">
            <span className="font-semibold">Payment processing.</span> Your reservation is
            held while we confirm your payment. This usually takes just a moment.
          </div>
        )}

        {/* ── CTA ──────────────────────────────────────────────── */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-stone hover:text-sand transition-colors"
          >
            ← Back to properties
          </Link>
        </div>

      </div>
    </div>
  );
}
