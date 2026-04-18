import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CheckoutForm from "@/components/public/CheckoutForm";
import OrderSummary from "@/components/public/OrderSummary";

export const metadata: Metadata = {
  title: "Complete Your Booking",
};

/* ── Mock property lookup (replace with DB query) ─────────────── */
const MOCK_PROPERTIES: Record<string, { name: string; location: string; nightlyRate: number }> = {
  "prop-1": { name: "Oceanfront Villa",   location: "Miami Beach, FL",  nightlyRate: 420 },
  "prop-2": { name: "Mountain Chalet",    location: "Aspen, CO",         nightlyRate: 380 },
  "prop-3": { name: "Tropical Bungalow",  location: "Key West, FL",      nightlyRate: 295 },
  "prop-4": { name: "Desert Retreat",     location: "Sedona, AZ",        nightlyRate: 260 },
  "prop-5": { name: "Lakeside Cottage",   location: "Lake Tahoe, CA",    nightlyRate: 340 },
  "prop-6": { name: "City Penthouse",     location: "New York, NY",      nightlyRate: 550 },
  "prop-7": { name: "Coastal Cottage",    location: "Malibu, CA",        nightlyRate: 490 },
  "prop-8": { name: "Vineyard Estate",    location: "Napa Valley, CA",   nightlyRate: 620 },
  "prop-9": { name: "Forest Cabin",       location: "Portland, OR",      nightlyRate: 210 },
  "prop-10":{ name: "Island Hideaway",    location: "Maui, HI",          nightlyRate: 680 },
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

  /* Validate all params are present */
  if (!propertyId || !checkIn || !checkOut) redirect("/");

  const property = MOCK_PROPERTIES[propertyId];
  if (!property) redirect("/");

  /* Validate dates */
  const checkInDate  = parseDateLocal(checkIn);
  const checkOutDate = parseDateLocal(checkOut);
  const nights = Math.round(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (nights <= 0) redirect(`/properties/${propertyId}`);

  const total = nights * property.nightlyRate;

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
            nightlyRate={property.nightlyRate}
            total={total}
          />

          {/* Right — Order summary */}
          <OrderSummary
            propertyName={property.name}
            location={property.location}
            checkIn={checkIn}
            checkOut={checkOut}
            nights={nights}
            nightlyRate={property.nightlyRate}
            total={total}
          />
        </div>

      </div>
    </div>
  );
}
