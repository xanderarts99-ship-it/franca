import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  CalendarDays,
  MapPin,
  User,
  Mail,
  Phone,
  Hash,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Booking Request Submitted",
  description: "Your booking request has been received.",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ bookingId?: string }>;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
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
      <Icon size={14} className="text-stone-light mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-light mb-0.5">
          {label}
        </p>
        <p className="text-sm text-charcoal font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

export default async function BookingConfirmationPage({
  searchParams,
}: PageProps) {
  const { bookingId } = await searchParams;

  if (!bookingId) redirect("/");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      property: {
        select: { name: true, location: true, nightlyRate: true, images: true },
      },
    },
  });

  if (
    !booking ||
    booking.status === "CANCELLED" ||
    booking.status === "EXPIRED"
  )
    redirect("/");

  const nightlyRate  = Number(booking.property.nightlyRate);
  const totalAmount  = Number(booking.totalAmount);
  const nightlyTotal = booking.nightlyTotal !== null ? Number(booking.nightlyTotal) : null;
  const cleaningFee  = booking.cleaningFee  !== null ? Number(booking.cleaningFee)  : null;
  const petFee       = booking.petFee       !== null ? Number(booking.petFee)       : null;
  const taxRate      = booking.taxRate      !== null ? Number(booking.taxRate)      : null;
  const taxAmount    = booking.taxAmount    !== null ? Number(booking.taxAmount)    : null;
  const hasBreakdown = nightlyTotal !== null;
  const isPending = booking.status === "PENDING_PAYMENT";

  function fmt(n: number) {
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 border border-amber-100 mb-5">
            <Clock size={32} className="text-amber-500" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal mb-2">
            Booking Request Submitted!
          </h1>
          <p className="text-stone text-sm leading-relaxed max-w-sm mx-auto">
            We&apos;ve received your request and sent a confirmation to{" "}
            <span className="text-charcoal font-medium">
              {booking.guestEmail}
            </span>
            .
          </p>
        </div>

        {/* ── Spam notice ──────────────────────────────────────── */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 mb-8">
          <Mail size={16} className="shrink-0 mt-0.5 text-amber-600" />
          <p className="text-sm text-amber-800">
            A confirmation email has been sent to{" "}
            <span className="font-semibold">{booking.guestEmail}</span>. If
            you don&apos;t see it within a few minutes, please check your spam
            or junk folder and add{" "}
            <span className="font-semibold">bookings@rammiesvacation.com</span>{" "}
            to your contacts.
          </p>
        </div>

        {/* ── Booking card ─────────────────────────────────────── */}
        <div className="bg-surface border border-warm-border rounded-card overflow-hidden mb-4">
          {/* Property banner */}
          <div className="h-32 w-full relative overflow-hidden">
            {booking.property.images[0] ? (
              <Image
                src={booking.property.images[0]}
                alt={booking.property.name}
                fill
                className="object-cover"
                sizes="672px"
              />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  background:
                    "linear-gradient(160deg, #0F2945 0%, #1B3A6B 50%, #C8834A 100%)",
                }}
              >
                <div className="h-full w-full bg-black/20 flex flex-col items-center justify-center gap-1">
                  <span className="font-serif text-white/30 text-3xl font-semibold">
                    RV
                  </span>
                </div>
              </div>
            )}

            {booking.property.images[0] && (
              <div className="absolute inset-0 bg-black/30" />
            )}

            {/* Reference badge */}
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
            {/* Status badge */}
            <div className="flex justify-center mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-100">
                <Clock size={11} />
                Awaiting Payment Confirmation
              </span>
            </div>

            {/* Property info */}
            <div className="text-center mb-6">
              <h2 className="font-serif text-xl font-semibold text-charcoal">
                {booking.property.name}
              </h2>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <MapPin size={11} className="text-stone-light" />
                <span className="text-xs text-stone">
                  {booking.property.location}
                </span>
              </div>
            </div>

            {/* Stay dates */}
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
              <DetailRow
                icon={User}
                label="Guest name"
                value={booking.guestName}
              />
              <DetailRow icon={Mail} label="Email" value={booking.guestEmail} />
              <DetailRow
                icon={Phone}
                label="Phone"
                value={booking.guestPhone}
              />
            </div>

            {/* Price summary */}
            <div className="bg-cream rounded-xl p-4 space-y-2">
              {hasBreakdown ? (
                <>
                  <div className="flex justify-between text-sm text-stone">
                    <span>Nightly total ({booking.totalNights} night{booking.totalNights !== 1 ? "s" : ""})</span>
                    <span className="text-charcoal">${fmt(nightlyTotal!)}</span>
                  </div>
                  {cleaningFee !== null && cleaningFee > 0 && (
                    <div className="flex justify-between text-sm text-stone">
                      <span>Cleaning fee</span>
                      <span className="text-charcoal">${fmt(cleaningFee)}</span>
                    </div>
                  )}
                  {petFee !== null && petFee > 0 && (
                    <div className="flex justify-between text-sm text-stone">
                      <span>🐾 Pet fee</span>
                      <span className="text-charcoal">${fmt(petFee)}</span>
                    </div>
                  )}
                  {taxAmount !== null && taxAmount > 0 && (
                    <div className="flex justify-between text-sm text-stone">
                      <span>Tax ({taxRate !== null ? `${Math.round(taxRate * 100)}%` : ""})</span>
                      <span className="text-charcoal">${fmt(taxAmount)}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-between text-sm text-stone">
                  <span>${nightlyRate.toLocaleString()} × {booking.totalNights} night{booking.totalNights !== 1 ? "s" : ""}</span>
                  <span className="text-charcoal">${(nightlyRate * booking.totalNights).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 mt-1 border-t border-warm-border">
                <span className="font-semibold text-charcoal text-sm">
                  Total to be charged
                </span>
                <span className="font-serif text-2xl font-semibold text-charcoal">
                  ${fmt(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── What happens next ────────────────────────────────── */}
        {isPending && (
          <div className="bg-surface border border-warm-border rounded-card p-5 mb-4">
            <h3 className="font-serif text-base font-semibold text-charcoal mb-4">
              What happens next
            </h3>
            <ol className="space-y-3">
              {[
                {
                  step: "Check your email",
                  desc: `We've sent your booking reference to ${booking.guestEmail}`,
                },
                {
                  step: "Receive your Payment Link",
                  desc: "We will send you a Stripe Payment Link within a few hours",
                },
                {
                  step: "Complete payment",
                  desc: "Pay via the secure link to confirm your booking",
                },
                {
                  step: "Get your confirmation",
                  desc: "You'll receive a final confirmation email once payment is verified",
                },
              ].map(({ step, desc }, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-sand/10 text-sand text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-sand/20">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-charcoal">
                      {step}
                    </p>
                    <p className="text-xs text-stone mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-4 flex items-start gap-2.5 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-3">
              <Clock size={13} className="shrink-0 mt-0.5" />
              <span>
                <strong>Important:</strong> Your booking request expires in 24
                hours if payment is not completed.
              </span>
            </div>
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
