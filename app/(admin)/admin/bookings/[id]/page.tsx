import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  User,
  Mail,
  Phone,
  Hash,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CancelBookingButton from "@/components/admin/CancelBookingButton";
import BookingActionButtons from "@/components/admin/BookingActionButtons";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Booking Detail — Admin" };

type DisplayStatus = "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "PENDING";

const STATUS_CONFIG: Record<DisplayStatus, { label: string; className: string; icon: React.ElementType }> = {
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: CheckCircle2,
  },
  PENDING_PAYMENT: {
    label: "Awaiting Payment",
    className: "bg-amber-50 text-amber-700 border-amber-100",
    icon: Clock,
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
  EXPIRED: {
    label: "Expired",
    className: "bg-stone-100 text-stone-500 border-stone-200",
    icon: Ban,
  },
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatExpiryCountdown(expiresAt: Date): string {
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();

  if (diffMs <= 0) return "expired";

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffHours >= 1) {
    return `in ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
  }

  if (diffMins >= 1) {
    return `in ${diffMins} minute${diffMins > 1 ? "s" : ""}`;
  }

  return expiresAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function InfoRow({
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
      <Icon size={13} className="text-stone-light mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-light mb-0.5">
          {label}
        </p>
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

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      property: { select: { name: true, location: true, nightlyRate: true } },
    },
  });

  if (!booking) notFound();

  const status = booking.status as BookingStatus;
  const cfg = STATUS_CONFIG[status as DisplayStatus] ?? STATUS_CONFIG.CANCELLED;
  const { label, className, icon: StatusIcon } = cfg;
  const nightlyRate = Number(booking.property.nightlyRate);
  const totalAmount = Number(booking.totalAmount);

  const isPendingPayment = status === "PENDING_PAYMENT";
  const isConfirmed = status === "CONFIRMED";
  const isClosed = status === "CANCELLED" || status === "EXPIRED";

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
              Submitted on {formatDate(booking.createdAt)}
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

      {/* ── Pending expiry banner ───────────────────────────────── */}
      {isPendingPayment && booking.expiresAt && (
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-sm text-amber-800">
          <Clock size={15} className="shrink-0 text-amber-600" />
          <span>
            <strong>Pending Payment</strong> — Expires{" "}
            <strong>{formatExpiryCountdown(booking.expiresAt)}</strong>
            {" "}(
            {booking.expiresAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
            )
          </span>
        </div>
      )}

      {/* ── Closed/expired status banner ───────────────────────── */}
      {isClosed && (
        <div className={cn(
          "flex items-center gap-2.5 rounded-xl px-4 py-3 mb-5 text-sm",
          status === "EXPIRED"
            ? "bg-stone-100 border border-stone-200 text-stone-600"
            : "bg-red-50 border border-red-100 text-red-700"
        )}>
          {status === "EXPIRED" ? <Ban size={15} className="shrink-0" /> : <XCircle size={15} className="shrink-0" />}
          <span>
            {status === "EXPIRED"
              ? "This booking request expired without payment being completed."
              : "This booking has been cancelled."}
            {booking.rejectionReason && (
              <span className="block text-xs mt-0.5 opacity-80">
                Reason: {booking.rejectionReason}
              </span>
            )}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Stay details */}
        <div className="bg-white border border-warm-border rounded-[var(--radius-card)] p-5">
          <h2 className="font-serif text-base font-semibold text-charcoal mb-1">Stay</h2>
          <div className="flex items-center gap-1.5 mb-4">
            <MapPin size={11} className="text-stone-light" />
            <span className="text-xs text-stone">{booking.property.location}</span>
          </div>

          <p className="font-medium text-charcoal text-sm mb-4">{booking.property.name}</p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-[#FAFAF7] rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1">
                <CalendarDays size={10} className="text-stone-light" />
                <p className="text-[9px] uppercase tracking-wider font-semibold text-stone-light">
                  Check-in
                </p>
              </div>
              <p className="text-xs font-semibold text-charcoal leading-snug">
                {formatDate(booking.checkIn)}
              </p>
            </div>
            <div className="bg-[#FAFAF7] rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1">
                <CalendarDays size={10} className="text-stone-light" />
                <p className="text-[9px] uppercase tracking-wider font-semibold text-stone-light">
                  Check-out
                </p>
              </div>
              <p className="text-xs font-semibold text-charcoal leading-snug">
                {formatDate(booking.checkOut)}
              </p>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="space-y-1.5 text-xs text-stone border-t border-warm-border pt-3">
            <div className="flex justify-between">
              <span>${nightlyRate.toLocaleString()} × {booking.totalNights} nights</span>
              <span className="text-charcoal">${(nightlyRate * booking.totalNights).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Booking fee</span>
              <span className="text-emerald-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between font-semibold text-charcoal text-sm pt-1.5 border-t border-warm-border">
              <span>Total</span>
              <span>${totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Guest + payment notes */}
        <div className="flex flex-col gap-4">

          {/* Guest */}
          <div className="bg-white border border-warm-border rounded-[var(--radius-card)] p-5">
            <h2 className="font-serif text-base font-semibold text-charcoal mb-3">Guest</h2>
            <InfoRow icon={User}  label="Name"  value={booking.guestName} />
            <InfoRow icon={Mail}  label="Email" value={booking.guestEmail} />
            <InfoRow icon={Phone} label="Phone" value={booking.guestPhone} />
          </div>

          {/* Payment notes (only shown when present) */}
          {booking.paymentNotes && (
            <div className="bg-white border border-warm-border rounded-[var(--radius-card)] p-5">
              <h2 className="font-serif text-base font-semibold text-charcoal mb-3">Payment</h2>
              <InfoRow icon={FileText} label="Notes" value={booking.paymentNotes} />
            </div>
          )}

          {/* Stripe payment intent (legacy confirmed bookings only) */}
          {booking.stripePaymentIntentId && (
            <div className="bg-white border border-warm-border rounded-[var(--radius-card)] p-5">
              <h2 className="font-serif text-base font-semibold text-charcoal mb-3">Stripe</h2>
              <InfoRow
                icon={FileText}
                label="Payment Intent"
                value={booking.stripePaymentIntentId}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Pending: confirm / reject ───────────────────────────── */}
      {isPendingPayment && (
        <div className="mt-6 bg-white border border-warm-border rounded-[var(--radius-card)] p-5">
          <h2 className="font-serif text-base font-semibold text-charcoal mb-1">
            Actions
          </h2>
          <p className="text-xs text-stone leading-relaxed mb-4">
            Once you have received payment via the Stripe Payment Link, confirm the booking
            below. The dates will be blocked and a confirmation email will be sent to the guest.
          </p>
          <BookingActionButtons
            bookingId={booking.id}
            bookingReference={booking.bookingReference}
            totalAmount={totalAmount}
            guestEmail={booking.guestEmail}
          />
        </div>
      )}

      {/* ── Confirmed: cancel ───────────────────────────────────── */}
      {isConfirmed && (
        <div className="mt-6 bg-white border border-warm-border rounded-[var(--radius-card)] p-5">
          <h2 className="font-serif text-base font-semibold text-charcoal mb-1">
            Cancel booking
          </h2>
          <p className="text-xs text-stone leading-relaxed mb-4">
            This will mark the booking as cancelled and free up the dates. Any refund must be
            issued manually via the Stripe dashboard.
          </p>
          <CancelBookingButton
            bookingId={booking.id}
            bookingReference={booking.bookingReference}
          />
        </div>
      )}

    </div>
  );
}
