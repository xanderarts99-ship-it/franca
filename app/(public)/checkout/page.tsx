import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CheckoutForm from "@/components/public/CheckoutForm";
import OrderSummary from "@/components/public/OrderSummary";
import { prisma } from "@/lib/prisma";
import { calculateBookingTotal } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Complete Your Booking",
  description: "Secure your vacation rental reservation with Rammies Vacation Rentals.",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ propertyId?: string; checkIn?: string; checkOut?: string; includePetFee?: string }>;
}

function parseDateLocal(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const { propertyId, checkIn, checkOut, includePetFee: includePetFeeParam } = await searchParams;
  const includePetFee = includePetFeeParam === "true";

  if (!propertyId || !checkIn || !checkOut) redirect("/");

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      name: true,
      location: true,
      nightlyRate: true,
      images: true,
      cancellationPolicy: {
        select: { name: true, policyText: true },
      },
    },
  });
  if (!property) redirect("/");

  const checkInDate  = parseDateLocal(checkIn);
  const checkOutDate = parseDateLocal(checkOut);
  const nights = Math.round(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (nights <= 0) redirect(`/properties/${propertyId}`);

  // Calculate full breakdown from pricing library
  let breakdown: {
    nightlyTotal: number;
    cleaningFee: number;
    petFee: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    hasCustomPricing: boolean;
    nightlyBreakdown: { date: string; price: number }[];
  };

  try {
    breakdown = await calculateBookingTotal(propertyId, checkInDate, checkOutDate, includePetFee);
  } catch {
    // Fallback to simple nightly rate calculation
    const nightlyTotal = Number(property.nightlyRate) * nights;
    breakdown = {
      nightlyTotal,
      cleaningFee: 0,
      petFee: 0,
      taxRate: 0.06,
      taxAmount: 0,
      totalAmount: nightlyTotal,
      hasCustomPricing: false,
      nightlyBreakdown: [],
    };
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        {/* ── Back link ─────────────────────────────────────── */}
        <Link
          href={`/properties/${propertyId}`}
          className="inline-flex items-center gap-2 text-sm text-stone hover:text-sand transition-colors mb-8 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to property
        </Link>

        {/* ── Page title ────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal">
            Complete your booking
          </h1>
          <p className="text-stone text-sm mt-1.5">
            Fill in your details and we&apos;ll send you a payment link to confirm your stay.
          </p>
        </div>

        {/* ── Two-column layout ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-12 items-start">

          {/* Left — Form */}
          <CheckoutForm
            propertyId={propertyId}
            propertyName={property.name}
            checkIn={checkIn}
            checkOut={checkOut}
            nights={nights}
            nightlyRate={Number(property.nightlyRate)}
            total={breakdown.totalAmount}
            cancellationPolicyText={property.cancellationPolicy?.policyText}
            cancellationPolicyName={property.cancellationPolicy?.name}
            includePetFee={includePetFee}
          />

          {/* Right — Order summary */}
          <OrderSummary
            propertyName={property.name}
            location={property.location}
            image={property.images[0]}
            checkIn={checkIn}
            checkOut={checkOut}
            nights={nights}
            nightlyRate={Number(property.nightlyRate)}
            nightlyTotal={breakdown.nightlyTotal}
            cleaningFee={breakdown.cleaningFee}
            petFee={breakdown.petFee}
            taxRate={breakdown.taxRate}
            taxAmount={breakdown.taxAmount}
            total={breakdown.totalAmount}
            hasCustomPricing={breakdown.hasCustomPricing}
            nightlyBreakdown={breakdown.nightlyBreakdown}
          />
        </div>

      </div>
    </div>
  );
}
