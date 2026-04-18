import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPin, Star, Home } from "lucide-react";
import PhotoGrid from "@/components/public/PhotoGrid";
import BookingWidget from "@/components/public/BookingWidget";
import AvailabilityCalendar from "@/components/public/AvailabilityCalendar";
import { notFound } from "next/navigation";

/* ── Mock data (replace with DB query once Prisma is wired up) ── */
const MOCK_PROPERTIES: Record<string, {
  id: string;
  name: string;
  location: string;
  description: string;
  nightlyRate: number;
  amenities: string[];
  images: string[];
  blockedDates: string[];
}> = {
  "prop-1": {
    id: "prop-1",
    name: "Oceanfront Villa",
    location: "Miami Beach, FL",
    description:
      "Wake up to the sound of waves in this stunning oceanfront villa. Floor-to-ceiling windows frame an endless Atlantic horizon, while the private infinity pool blends seamlessly into the sea beyond. Designed for those who demand the very best, this five-bedroom retreat offers chef-grade appliances, a home theatre, and direct beach access — all just steps from Miami's most vibrant dining and culture.",
    nightlyRate: 420,
    amenities: [
      "Ocean View","Private Pool","WiFi","Air Conditioning","Full Kitchen",
      "Beach Access","Home Theatre","Parking","BBQ","Outdoor Shower",
    ],
    images: [],
    blockedDates: [],
  },
  "prop-2": {
    id: "prop-2",
    name: "Mountain Chalet",
    location: "Aspen, CO",
    description:
      "Perched above the treeline with panoramic views of the Elk Mountains, this timber-frame chalet is the definitive alpine escape. The oversized stone fireplace, hand-hewn wooden beams, and plush après-ski lounge set the tone. Step out the back door onto groomed trails, or soak in the outdoor hot tub under a blanket of stars. Sleeps eight with ease.",
    nightlyRate: 380,
    amenities: [
      "Mountain View","Hot Tub","Fireplace","Ski Access","WiFi",
      "Full Kitchen","Parking","Game Room","Sauna","Fire Pit",
    ],
    images: [],
    blockedDates: [],
  },
  "prop-3": {
    id: "prop-3",
    name: "Tropical Bungalow",
    location: "Key West, FL",
    description:
      "Hidden behind a canopy of bougainvillea, this charming Key West bungalow is your private slice of paradise. Hardwood floors, louvred shutters, and a wraparound porch bring the tropical breeze indoors. Stroll to Duval Street in minutes, or spend the day swaying in a hammock with a cold drink. The perfect base for reef snorkelling, sunset cruises, and complete disconnection.",
    nightlyRate: 295,
    amenities: [
      "Garden","Beach Access","Hammock","WiFi","Air Conditioning",
      "Bicycle Hire","Porch","Full Kitchen","Outdoor Shower","Parking",
    ],
    images: [],
    blockedDates: [],
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = MOCK_PROPERTIES[id];
  if (!property) return { title: "Property Not Found" };
  return {
    title: `${property.name} — ${property.location}`,
    description: property.description.slice(0, 155),
  };
}

const AMENITY_ICONS: Record<string, string> = {
  "WiFi": "📶", "Pool": "🏊", "Private Pool": "🏊", "Hot Tub": "♨️",
  "Fireplace": "🔥", "Fire Pit": "🔥", "BBQ": "🍖", "Parking": "🚗",
  "Ocean View": "🌊", "Mountain View": "⛰️", "Beach Access": "🏖️",
  "Air Conditioning": "❄️", "Full Kitchen": "🍳", "Sauna": "🧖",
  "Gym": "💪", "Game Room": "🎮", "Home Theatre": "🎬", "Garden": "🌿",
  "Hammock": "🌴", "Deck": "🪵", "Rooftop": "🏙️", "Ski Access": "⛷️",
  "Kayaks": "🛶", "Lake Access": "🏞️", "Snorkeling": "🤿",
  "Bicycle Hire": "🚲", "Outdoor Shower": "🚿", "Porch": "🏡",
};

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const property = MOCK_PROPERTIES[id] ?? null;

  if (!property) notFound();

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        {/* ── Breadcrumb ───────────────────────────────────────── */}
        <Link
          href="/#properties"
          className="inline-flex items-center gap-2 text-sm text-stone hover:text-sand transition-colors mb-6 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          All Properties
        </Link>

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-charcoal leading-tight">
                {property.name}
              </h1>
              <div className="flex items-center gap-1.5 mt-2">
                <MapPin size={14} className="text-stone-light flex-shrink-0" />
                <span className="text-stone text-sm md:text-base">{property.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-stone bg-surface border border-warm-border rounded-full px-3 py-1.5">
              <Star size={13} className="fill-sand text-sand" />
              <span className="font-medium text-charcoal">5.0</span>
              <span className="text-stone-light">· New listing</span>
            </div>
          </div>
        </div>

        {/* ── Photo grid ───────────────────────────────────────── */}
        <div className="mb-10">
          <PhotoGrid images={property.images} propertyName={property.name} />
        </div>

        {/* ── Two-column layout ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 lg:gap-16">

          {/* Left column */}
          <div className="min-w-0">

            {/* About */}
            <section className="pb-8 border-b border-warm-border">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex-shrink-0 w-9 h-9 bg-sand-light rounded-full flex items-center justify-center">
                  <Home size={16} className="text-sand" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-charcoal">Entire property</p>
                  <p className="text-xs text-stone">Privately owned by Franca</p>
                </div>
              </div>
              <h2 className="font-serif text-2xl font-semibold text-charcoal mb-3">
                About this property
              </h2>
              <p className="text-stone leading-relaxed text-sm md:text-base">
                {property.description}
              </p>
            </section>

            {/* Amenities */}
            <section className="py-8 border-b border-warm-border">
              <h2 className="font-serif text-2xl font-semibold text-charcoal mb-5">
                What this place offers
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 text-sm text-charcoal"
                  >
                    <span className="text-base w-6 text-center flex-shrink-0">
                      {AMENITY_ICONS[amenity] ?? "✓"}
                    </span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Availability calendar */}
            <section className="py-8">
              <AvailabilityCalendar blockedDates={property.blockedDates} />
            </section>
          </div>

          {/* Right column — sticky booking widget */}
          <div className="lg:block">
            <BookingWidget
              propertyId={property.id}
              nightlyRate={property.nightlyRate}
              blockedDates={property.blockedDates}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
