import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, User, Mail, Phone, Hash, CreditCard, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import CancelBookingButton from "@/components/admin/CancelBookingButton";

export const metadata: Metadata = { title: "Booking Detail — Admin" };

type Status = "PENDING" | "CONFIRMED" | "CANCELLED";

interface MockBooking {
  id: string;
  bookingReference: string;
  status: Status;
  propertyId: string;
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
  stripePaymentIntentId: string;
  createdAt: string;
}

const MOCK_BOOKINGS: Record<string, MockBooking> = {
  b1: {
    id: "b1",
    bookingReference: "VR-2026-000001",
    status: "CONFIRMED",
    propertyId: "prop-1",
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
    stripePaymentIntentId: "pi_3ABC123mock",
    createdAt: "2026-04-10",
  },
  b2: {
    id: "b2",
    bookingReference: "VR-2026-000002",
    status: "CONFIRMED",
    propertyId: "prop-2",
    propertyName: "Mountain Chalet",
    location: "Aspen, CO",
    guestName: "Marcus Webb",
    guestEmail: "marcus@example.com",
    guestPhone: "+1 (555) 111-2222",
    checkIn: "2026-07-14",
    checkOut: "2026-07-21",
    totalNights: 7,
    nightlyRate: 380,
    totalAmount: 2660,
    stripePaymentIntentId: "pi_3DEF456mock",
    createdAt: "2026-04-09",
  },
  b3: {
    id: "b3",
    bookingReference: "VR-2026-000003",
    status: "PENDING",
    propertyId: "prop-6",
    propertyName: "City Penthouse",
    location: "New York, NY",
    guestName: "Priya Nair",
    guestEmail: "priya@example.com",
    guestPhone: "+1 (555) 333-4444",
    checkIn: "2026-06-20",
    checkOut: "2026-06-23",
    totalNights: 3,
    nightlyRate: 550,
    totalAmount: 1650,
    stripePaymentIntentId: "pi_3GHI789mock",
    createdAt: "2026-04-18",
  },
  b4: {
    id: "b4",
    bookingReference: "VR-2026-000004",
    status: "CONFIRMED",
    propertyId: "prop-8",
    propertyName: "Vineyard Estate",
    location: "Napa Valley, CA",
    guestName: "Tom Hargreaves",
    guestEmail: "tom@example.com",
    guestPhone: "+1 (555) 555-6666",
    checkIn: "2026-09-05",
    checkOut: "2026-09-10",
    totalNights: 5,
    nightlyRate: 620,
    totalAmount: 3100,
    stripePaymentIntentId: "pi_3JKL012mock",
    createdAt: "2026-04-07",
  },
  b5: {
    id: "b5",
    bookingReference: "VR-2026-000005",
    status: "CANCELLED",
    propertyId: "prop-3",
    propertyName: "Tropical Bungalow",
    location: "Key West, FL",
    guestName: "Sofia Reyes",
    guestEmail: "sofia@example.com",
    guestPhone: "+1 (555) 777-8888",
    checkIn: "2026-05-10",
    checkOut: "2026-05-14",
    totalNights: 4,
    nightlyRate: 295,
    totalAmount: 1180,
    stripePaymentIntentId: "pi_3MNO345mock",
    createdAt: "2026-04-01",
  },
  b6: {
    id: "b6",
    bookingReference: "VR-2026-000006",
    status: "CONFIRMED",
    propertyId: "prop-10",
    propertyName: "Island Hideaway",
    location: "Maui, HI",
    guestName: "David Kim",
    guestEmail: "david@example.com",
    guestPhone: "+1 (555) 999-0000",
    checkIn: "2026-10-01",
    checkOut: "2026-10-08",
    totalNights: 7,
    nightlyRate: 680,
    totalAmount: 4760,
    stripePaymentIntentId: "pi_3PQR678mock",
    createdAt: "2026-04-15",
  },
};

const STATUS_CONFIG: Record<Status, { label: string; className: string; icon: React.ElementType }> = {
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: CheckCircle2,
  },
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-100",
    icon: Clock,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-50 text-red-600 border-red-100",
    icon: XCircle,
  },
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-warm-border last:border-0">
      <Icon size={13} className="text-stone-light mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-light mb-0.5">{label}</p>
        <p className="text-sm text-charcoal font-medium break-all">{value}</p>
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const booking = MOCK_BOOKINGS[id];
  if (!booking) notFound();

  const { label, className, icon: StatusIcon } = STATUS_CONFIG[booking.status];
  const canCancel = booking.status !== "CANCELLED";

  return (
    <div className="max-w-3xl">

      {/* Back + header */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-stone hover:text-sand transition-colors mb-4 group"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          All bookings
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <Hash size={14} className="text-stone-light" />
              <h1 className="font-mono text-lg font-semibold text-charcoal tracking-wide">
                {booking.bookingReference}
              </h1>
            </div>
            <p className="text-xs text-stone">
              Booked on {formatDate(booking.createdAt)}
            </p>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
              className
            )}
          >
            <StatusIcon size={11} />
            {label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Stay details */}
        <div className="bg-white border border-warm-border rounded-[var(--radius-card)] p-5">
          <h2 className="font-serif text-base font-semibold text-charcoal mb-1">Stay</h2>
          <div className="flex items-center gap-1.5 mb-4">
            <MapPin size={11} className="text-stone-light" />
            <span className="text-xs text-stone">{booking.location}</span>
          </div>

          <p className="font-medium text-charcoal text-sm mb-4">{booking.propertyName}</p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-[#FAFAF7] rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1">
                <CalendarDays size={10} className="text-stone-light" />
                <p className="text-[9px] uppercase tracking-wider font-semibold text-stone-light">Check-in</p>
              </div>
              <p className="text-xs font-semibold text-charcoal leading-snug">{formatDate(booking.checkIn)}</p>
            </div>
            <div className="bg-[#FAFAF7] rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1">
                <CalendarDays size={10} className="text-stone-light" />
                <p className="text-[9px] uppercase tracking-wider font-semibold text-stone-light">Check-out</p>
              </div>
              <p className="text-xs font-semibold text-charcoal leading-snug">{formatDate(booking.checkOut)}</p>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="space-y-1.5 text-xs text-stone border-t border-warm-border pt-3">
            <div className="flex justify-between">
              <span>${booking.nightlyRate.toLocaleString()} × {booking.totalNights} nights</span>
              <span className="text-charcoal">${(booking.nightlyRate * booking.totalNights).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Booking fee</span>
              <span className="text-emerald-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between font-semibold text-charcoal text-sm pt-1.5 border-t border-warm-border">
              <span>Total</span>
              <span>${booking.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Guest + payment */}
        <div className="flex flex-col gap-4">

          {/* Guest */}
          <div className="bg-white border border-warm-border rounded-[var(--radius-card)] p-5">
            <h2 className="font-serif text-base font-semibold text-charcoal mb-3">Guest</h2>
            <InfoRow icon={User}  label="Name"  value={booking.guestName} />
            <InfoRow icon={Mail}  label="Email" value={booking.guestEmail} />
            <InfoRow icon={Phone} label="Phone" value={booking.guestPhone} />
          </div>

          {/* Payment */}
          <div className="bg-white border border-warm-border rounded-[var(--radius-card)] p-5">
            <h2 className="font-serif text-base font-semibold text-charcoal mb-3">Payment</h2>
            <InfoRow
              icon={CreditCard}
              label="Stripe Payment Intent"
              value={booking.stripePaymentIntentId}
            />
          </div>
        </div>
      </div>

      {/* Cancel action */}
      {canCancel && (
        <div className="mt-6 bg-white border border-warm-border rounded-[var(--radius-card)] p-5">
          <h2 className="font-serif text-base font-semibold text-charcoal mb-1">
            Cancel booking
          </h2>
          <p className="text-xs text-stone leading-relaxed mb-4">
            This will mark the booking as cancelled and free up the dates. Any Stripe refund
            must be issued manually via the Stripe dashboard.
          </p>
          <CancelBookingButton bookingId={booking.id} bookingReference={booking.bookingReference} />
        </div>
      )}

    </div>
  );
}
