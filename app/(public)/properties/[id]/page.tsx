import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPin, Star, Home, Users, BedDouble, Bed, Bath } from "lucide-react";
import PhotoGrid from "@/components/public/PhotoGrid";
import BookingWidget from "@/components/public/BookingWidget";
import PropertyCalendar, { PropertyDateProvider } from "@/components/public/PropertyCalendar";
import PropertyReviews from "@/components/public/PropertyReviews";
import PropertyAmenities from "@/components/public/PropertyAmenities";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPropertyReviewStats, getPropertyReviews } from "@/lib/reviews";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    select: {
      name: true,
      description: true,
      images: true,
      location: true,
      guests: true,
      bedrooms: true,
      bathrooms: true,
    },
  });
  if (!property) return { title: "Property Not Found" };

  const title = `${property.name} — Vacation Rental in ${property.location}`;
  const description = `${property.bedrooms} bed, ${property.bathrooms} bath vacation rental for up to ${property.guests} guests in ${property.location}. ${property.description.slice(0, 120)}...`;

  return {
    title,
    description,
    alternates: { canonical: `/properties/${id}` },
    openGraph: {
      title,
      description,
      images: property.images[0]
        ? [{ url: property.images[0], width: 1200, height: 630, alt: property.name }]
        : [{ url: "/og-image.jpg", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: property.images[0] ? [property.images[0]] : ["/og-image.jpg"],
    },
  };
}


export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [property, reviewStats, { reviews }] = await Promise.all([
    prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        location: true,
        description: true,
        nightlyRate: true,
        guests: true,
        bedrooms: true,
        beds: true,
        bathrooms: true,
        amenities: true,
        images: true,
      },
    }),
    getPropertyReviewStats(id),
    getPropertyReviews(id, 1, 20),
  ]);

  if (!property) notFound();

  const propertyLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: property.name,
    description: property.description,
    url: `https://www.rammiesvacation.com/properties/${property.id}`,
    image: property.images[0] ?? "https://www.rammiesvacation.com/og-image.jpg",
    address: {
      "@type": "PostalAddress",
      addressLocality: property.location,
      addressRegion: "TX",
      addressCountry: "US",
    },
    amenityFeature: property.amenities.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
      value: true,
    })),
  };

  return (
    <div className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertyLd) }}
      />
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
                <MapPin size={14} className="text-stone-light shrink-0" />
                <span className="text-stone text-sm md:text-base">{property.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-stone bg-surface border border-warm-border rounded-full px-3 py-1.5">
              <Star size={13} className="fill-sand text-sand" />
              {reviewStats.totalReviews > 0 ? (
                <>
                  <span className="font-medium text-charcoal">
                    {reviewStats.averageRating.toFixed(1)}
                  </span>
                  <span className="text-stone-light">
                    · {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? "s" : ""}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-medium text-charcoal">5.0</span>
                  <span className="text-stone-light">· New listing</span>
                </>
              )}
            </div>
          </div>

          {/* ── Property stats row ────────────────────────────── */}
          <div className="grid grid-cols-2 sm:flex sm:flex-row sm:items-center gap-3 sm:gap-6 mt-4 pt-4 border-t border-warm-border text-sm text-stone">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-stone-light shrink-0" />
              <span>
                <span className="font-semibold text-charcoal">{property.guests}</span>{" "}
                {property.guests === 1 ? "guest" : "guests"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BedDouble size={15} className="text-stone-light shrink-0" />
              <span>
                <span className="font-semibold text-charcoal">{property.bedrooms}</span>{" "}
                {property.bedrooms === 1 ? "bedroom" : "bedrooms"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bed size={15} className="text-stone-light shrink-0" />
              <span>
                <span className="font-semibold text-charcoal">{property.beds}</span>{" "}
                {property.beds === 1 ? "bed" : "beds"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bath size={15} className="text-stone-light shrink-0" />
              <span>
                <span className="font-semibold text-charcoal">{property.bathrooms}</span>{" "}
                {property.bathrooms === 1 ? "bathroom" : "bathrooms"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Photo grid ───────────────────────────────────────── */}
        <div className="mb-10">
          <PhotoGrid images={property.images} propertyName={property.name} />
        </div>

        {/* ── Two-column layout (shared date-selection context) ── */}
        <PropertyDateProvider>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 lg:gap-16">

            {/* Left column */}
            <div className="min-w-0">

              {/* About */}
              <section className="pb-8 border-b border-warm-border">
                <div className="flex items-center gap-3 mb-4">
                  <span className="shrink-0 w-9 h-9 bg-sand-light rounded-full flex items-center justify-center">
                    <Home size={16} className="text-sand" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-charcoal">Entire property</p>
                    <p className="text-xs text-stone">Privately owned by Rammie&apos;s Vacation</p>
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
              <PropertyAmenities amenities={property.amenities} />

              {/* Guest Reviews */}
              <PropertyReviews
                reviews={reviews.map((r) => ({
                  id: r.id,
                  guestName: r.guestName,
                  guestLocation: r.guestLocation ?? null,
                  rating: r.rating,
                  comment: r.comment,
                  reviewDate: r.reviewDate.toISOString(),
                }))}
                averageRating={reviewStats.averageRating}
                totalReviews={reviewStats.totalReviews}
              />

              {/* Interactive availability calendar */}
              <section className="py-8">
                <PropertyCalendar propertyId={property.id} />
              </section>
            </div>

            {/* Right column — sticky booking widget */}
            <div className="lg:block">
              <BookingWidget
                propertyId={property.id}
                nightlyRate={Number(property.nightlyRate)}
              />
            </div>
          </div>
        </PropertyDateProvider>

      </div>
    </div>
  );
}
