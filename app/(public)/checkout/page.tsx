import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CheckoutForm from "@/components/public/CheckoutForm";
import OrderSummary from "@/components/public/OrderSummary";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Complete Your Booking",
};

interface PageProps {
  searchParams: Promise<{ propertyId?: string; checkIn?: string; checkOut?: string }>;
}

function parseDateLocal(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const { propertyId, checkIn, checkOut } = await searchParams;

  if (!propertyId || !checkIn || !checkOut) redirect("/");

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { name: true, location: true, nightlyRate: true },
  });
  if (!property) redirect("/");

  const checkInDate  = parseDateLocal(checkIn);
  const checkOutDate = parseDateLocal(checkOut);
  const nights = Math.round(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (nights <= 0) redirect(`/properties/${propertyId}`);

  const nightlyRate = Number(property.nightlyRate);
  const total = nights * nightlyRate;

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
            You're just one step away from securing your stay.
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
            nightlyRate={nightlyRate}
            total={total}
          />

          {/* Right — Order summary */}
          <OrderSummary
            propertyName={property.name}
            location={property.location}
            checkIn={checkIn}
            checkOut={checkOut}
            nights={nights}
            nightlyRate={nightlyRate}
            total={total}
          />
        </div>

      </div>
    </div>
  );
}
