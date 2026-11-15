import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CheckoutForm from "@/components/public/CheckoutForm";
import OrderSummary from "@/components/public/OrderSummary";
import { prisma } from "@/lib/prisma";
import { calculateBookingTotal } from "@/lib/pricing";
import { parseStayDate, stayNights } from "@/lib/stay-dates";
import { getStayPolicy } from "@/lib/stay-policy";
import { validateStay, StayValidationError } from "@/lib/stay-rules";

export const metadata: Metadata = {
  title: "Complete Your Booking",
  description: "Secure your vacation rental reservation with Rammies Vacation Rentals.",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ propertyId?: string; checkIn?: string; checkOut?: string; petCount?: string }>;
}

function parseDateLocal(str: string): Date {
  return parseStayDate(str);
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const { propertyId, checkIn, checkOut, petCount: petCountParam } = await searchParams;
  const petCount = Math.min(3, Math.max(0, parseInt(petCountParam ?? "0", 10) || 0));

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

  try {
    validateStay(await getStayPolicy(propertyId), checkIn, checkOut);
  } catch (error) {
    return <div className="max-w-xl mx-auto px-6 pt-28 pb-20">
      <h1 className="font-serif text-3xl text-charcoal mb-4">{error instanceof StayValidationError ? "Please adjust your dates" : "Please try again"}</h1>
      <p className="text-stone mb-6">{error instanceof StayValidationError ? error.message : "We couldn’t check the stay rules right now. Please retry before submitting your booking."}</p>
      <Link className="text-charcoal underline" href={`/properties/${propertyId}`}>Choose new dates</Link>
    </div>;
  }
  const checkInDate = parseDateLocal(checkIn);
  const checkOutDate = parseDateLocal(checkOut);
  const nights = stayNights(checkIn, checkOut);

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
    breakdown = await calculateBookingTotal(propertyId, checkInDate, checkOutDate, petCount);
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
            petCount={petCount}
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
            petCount={petCount}
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
