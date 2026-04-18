import type { Metadata } from "next";
import PropertyCard from "@/components/public/PropertyCard";
import { ArrowDown } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rammies Vacation — Handpicked Vacation Rentals",
};

const MOCK_PROPERTIES = [
  {
    id: "prop-1",
    name: "Oceanfront Villa",
    location: "Miami Beach, FL",
    nightlyRate: 420,
    coverImageUrl: null,
    amenities: ["Ocean View", "Private Pool", "WiFi"],
  },
  {
    id: "prop-2",
    name: "Mountain Chalet",
    location: "Aspen, CO",
    nightlyRate: 380,
    coverImageUrl: null,
    amenities: ["Hot Tub", "Fireplace", "Ski Access"],
  },
  {
    id: "prop-3",
    name: "Tropical Bungalow",
    location: "Key West, FL",
    nightlyRate: 295,
    coverImageUrl: null,
    amenities: ["Beach Access", "Garden", "Hammock"],
  },
  {
    id: "prop-4",
    name: "Desert Retreat",
    location: "Sedona, AZ",
    nightlyRate: 260,
    coverImageUrl: null,
    amenities: ["Hot Tub", "Red Rock Views", "Patio"],
  },
  {
    id: "prop-5",
    name: "Lakeside Cottage",
    location: "Lake Tahoe, CA",
    nightlyRate: 340,
    coverImageUrl: null,
    amenities: ["Lake Access", "Kayaks", "Deck"],
  },
  {
    id: "prop-6",
    name: "City Penthouse",
    location: "New York, NY",
    nightlyRate: 550,
    coverImageUrl: null,
    amenities: ["Skyline View", "Rooftop", "Gym"],
  },
  {
    id: "prop-7",
    name: "Coastal Cottage",
    location: "Malibu, CA",
    nightlyRate: 490,
    coverImageUrl: null,
    amenities: ["Ocean View", "Private Beach", "BBQ"],
  },
  {
    id: "prop-8",
    name: "Vineyard Estate",
    location: "Napa Valley, CA",
    nightlyRate: 620,
    coverImageUrl: null,
    amenities: ["Wine Cellar", "Pool", "Gardens"],
  },
  {
    id: "prop-9",
    name: "Forest Cabin",
    location: "Portland, OR",
    nightlyRate: 210,
    coverImageUrl: null,
    amenities: ["Hot Tub", "Fire Pit", "Hiking"],
  },
  {
    id: "prop-10",
    name: "Island Hideaway",
    location: "Maui, HI",
    nightlyRate: 680,
    coverImageUrl: null,
    amenities: ["Ocean View", "Pool", "Snorkeling"],
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient — sunset over water */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #0F2945 0%, #1B3A6B 38%, #7A4E2D 72%, #C8834A 88%, #E8B87A 100%)",
          }}
        />
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-sand mb-5 font-medium">
            10 Curated Properties
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-white leading-[1.05] tracking-tight mb-6">
            Find Your
            <br />
            <span className="italic font-normal text-sand">
              Perfect Escape
            </span>
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-xl mx-auto leading-relaxed mb-10">
            Handpicked vacation rentals with everything you need for an
            unforgettable stay. Browse, book, and escape.
          </p>
          <Link
            href="/#properties"
            className="inline-flex items-center gap-2 bg-sand hover:bg-sand-dark text-white text-sm font-semibold px-8 py-4 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-sand/20 active:scale-95"
          >
            Browse Properties
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ArrowDown size={14} className="animate-bounce" />
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────── */}
      <section className="bg-surface border-y border-warm-border">
        <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-3 divide-x divide-warm-border text-center">
          {[
            { value: "10", label: "Properties" },
            { value: "100%", label: "Private Owned" },
            { value: "5★", label: "Guest Rated" },
          ].map(({ value, label }) => (
            <div key={label} className="px-4 py-2">
              <p className="font-serif text-2xl md:text-3xl font-semibold text-charcoal">
                {value}
              </p>
              <p className="text-xs text-stone mt-0.5 uppercase tracking-wider">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Properties Grid ───────────────────────────────────── */}
      <section id="properties" className="py-20 md:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="mb-12 md:mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-sand font-medium mb-3">
              Available Now
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <h2 className="font-serif text-4xl md:text-5xl font-semibold text-charcoal leading-tight">
                Our Properties
              </h2>
              <p className="text-stone text-sm max-w-xs sm:text-right leading-relaxed">
                Each property is privately owned and curated for quality,
                comfort, and character.
              </p>
            </div>
            <div className="mt-5 w-12 h-0.5 bg-sand" />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {MOCK_PROPERTIES.map((property, i) => (
              <PropertyCard key={property.id} {...property} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section className="bg-charcoal text-white py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
            Ready to book your stay?
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            Browse all 10 properties and secure your dates in minutes. No
            hidden fees, no surprises.
          </p>
          <Link
            href="/#properties"
            className="inline-flex items-center gap-2 bg-sand hover:bg-sand-dark text-white text-sm font-semibold px-8 py-4 rounded-full transition-all duration-200 hover:shadow-lg active:scale-95"
          >
            View All Properties
          </Link>
        </div>
      </section>
    </>
  );
}
