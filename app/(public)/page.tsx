import type { Metadata } from "next";
import PropertyCard from "@/components/public/PropertyCard";
import LoadMoreProperties from "@/components/public/LoadMoreProperties";
import TestimonialsCarousel from "@/components/public/TestimonialsCarousel";
import { Home, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getFeaturedReviews } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Rammies Vacation — Handpicked Vacation Rentals",
};

const INITIAL_LIMIT = 6;

export default async function HomePage() {
  const [allProperties, featuredReviews] = await Promise.all([
    prisma.property.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        nightlyRate: true,
        coverImageUrl: true,
        amenities: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    getFeaturedReviews(6),
  ]);

  const total = allProperties.length;
  const firstProperties = allProperties.slice(0, Math.min(2, total));
  const remainingInitial = allProperties.slice(2, INITIAL_LIMIT);
  const hasMore = total > INITIAL_LIMIT;

  const PERKS = [
    {
      icon: <Home size={20} />,
      title: "Privately Owned",
      desc: "Every property is personally managed by a single owner. No chains, no cutting corners — just genuine hospitality.",
    },
    {
      icon: <ShieldCheck size={20} />,
      title: "Transparent Pricing",
      desc: "The rate you see is the rate you pay. No hidden fees, no surprises at checkout. Ever.",
    },
    {
      icon: <Star size={20} />,
      title: "5-Star Rated",
      desc: "Consistently rated 5 stars by guests for comfort, cleanliness, and care at every property.",
    },
  ];

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #0F2945 0%, #1B3A6B 38%, #7A4E2D 72%, #C8834A 88%, #E8B87A 100%)",
          }}
        />

        {/* Darkening overlay */}
        <div className="absolute inset-0 bg-black/25" />

        {/* Radial sand glow — bottom right for warmth */}
        <div
          className="absolute bottom-0 right-0 w-175 h-175 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(181,149,106,0.13) 0%, transparent 65%)",
          }}
        />

        {/* Decorative background word */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span
            className="font-serif font-semibold text-white whitespace-nowrap leading-none"
            style={{
              fontSize: "clamp(80px, 20vw, 260px)",
              opacity: 0.04,
              letterSpacing: "0.06em",
            }}
            aria-hidden="true"
          >
            ESCAPE
          </span>
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="hero-fade-1 text-[11px] uppercase tracking-[0.35em] text-sand mb-6 font-medium">
            {total} Curated Properties
          </p>
          <h1 className="hero-fade-2 font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-white leading-[1.05] tracking-tight mb-6">
            Find Your
            <br />
            <span className="italic font-normal text-sand">Perfect Escape</span>
          </h1>
          <p className="hero-fade-3 text-base md:text-lg text-white/65 max-w-md mx-auto leading-relaxed mb-10">
            Handpicked vacation rentals with everything you need for an
            unforgettable stay. Browse, book, and escape.
          </p>

          <div className="hero-fade-4">
            <Link
              href="/#properties"
              className="inline-flex items-center gap-2 bg-sand hover:bg-sand-dark text-white text-sm font-semibold px-9 py-4 rounded-full transition-all duration-200 hover:shadow-xl active:scale-95"
            >
              Browse Properties
            </Link>
          </div>

          {/* Inline stats */}
          <div className="hero-fade-5 mt-14 flex items-center justify-center">
            {[
              { value: String(total), label: "Properties" },
              { value: "100%", label: "Private Owned" },
              { value: "5★", label: "Guest Rated" },
            ].map(({ value, label }, i) => (
              <div key={label} className="flex items-center">
                {i > 0 && <div className="w-px h-8 bg-white/20 mx-8 sm:mx-12" />}
                <div className="text-center">
                  <p className="font-serif text-2xl sm:text-3xl font-semibold text-white">
                    {value}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator — traveling line */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/30">
            Scroll
          </span>
          <div className="w-px h-14 bg-white/15 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full h-1/2 bg-white/55"
              style={{ animation: "scrollLine 2s ease-in-out infinite" }}
            />
          </div>
        </div>
      </section>

      {/* ── Properties ────────────────────────────────────────── */}
      <section id="properties" className="py-20 md:py-28 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="mb-14">
            <p className="text-[11px] uppercase tracking-[0.35em] text-sand font-medium mb-4">
              Available Now
            </p>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <h2 className="font-serif text-5xl md:text-6xl font-semibold text-charcoal leading-[1.05] tracking-tight">
                Our Properties
              </h2>
              <p className="text-stone text-sm max-w-xs leading-relaxed lg:text-right lg:mb-2">
                Each property is privately owned and curated for quality,
                comfort, and character.
              </p>
            </div>
            <div className="mt-6 h-px w-full bg-warm-border relative">
              <div className="absolute left-0 top-0 h-full w-16 bg-sand" />
            </div>
          </div>

          {/* Featured first two + initial grid */}
          {total >= 2 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
                <div className="md:col-span-2">
                  <PropertyCard
                    {...firstProperties[0]}
                    nightlyRate={Number(firstProperties[0].nightlyRate)}
                    index={0}
                    featured
                  />
                </div>
                <div>
                  <PropertyCard
                    {...firstProperties[1]}
                    nightlyRate={Number(firstProperties[1].nightlyRate)}
                    index={1}
                  />
                </div>
              </div>

              {/* Remaining properties with Load More */}
              {total > 2 && (
                <LoadMoreProperties
                  initialProperties={remainingInitial.map((p) => ({
                    ...p,
                    nightlyRate: Number(p.nightlyRate),
                  }))}
                  total={total}
                  startIndex={2}
                />
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {allProperties.map((property, i) => (
                <PropertyCard
                  key={property.id}
                  {...property}
                  nightlyRate={Number(property.nightlyRate)}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Testimonials (only when reviews exist) ────────────── */}
      {featuredReviews.length > 0 && (
        <section className="py-20 md:py-24 bg-charcoal">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="mb-10">
              <p className="text-[11px] uppercase tracking-[0.35em] text-sand font-medium mb-4">
                Guest Testimonials
              </p>
              <h2 className="font-serif text-4xl md:text-5xl font-semibold text-white leading-[1.05] tracking-tight">
                What Our Guests Say
              </h2>
            </div>
            <TestimonialsCarousel
              reviews={featuredReviews.map((r) => ({
                id: r.id,
                guestName: r.guestName,
                guestLocation: r.guestLocation ?? null,
                rating: r.rating,
                comment: r.comment,
                reviewDate: r.reviewDate.toISOString(),
                propertyName: r.property.name,
              }))}
            />
          </div>
        </section>
      )}

      {/* ── Perks strip ───────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-cream-dark border-y border-warm-border">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {PERKS.map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-4">
                <div className="w-11 h-11 rounded-xl bg-sand-light flex items-center justify-center text-sand shrink-0">
                  {icon}
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-charcoal">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm text-stone leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section className="relative bg-charcoal text-white py-24 md:py-32 px-4 overflow-hidden">
        {/* Decorative large property count */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 md:pr-12 pointer-events-none select-none">
          <span
            className="font-serif font-bold text-white leading-none"
            style={{
              fontSize: "clamp(140px, 22vw, 300px)",
              opacity: 0.05,
            }}
            aria-hidden="true"
          >
            {total}
          </span>
        </div>

        <div className="relative max-w-2xl mx-auto text-center">
          <p className="text-[11px] uppercase tracking-[0.35em] text-sand font-medium mb-5">
            Start Planning
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-5 leading-tight">
            Ready to book
            <br />
            <span className="italic font-normal text-sand">your stay?</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
            Browse all {total} properties and secure your dates in minutes. No
            hidden fees, no surprises.
          </p>
          <Link
            href="/#properties"
            className="inline-flex items-center gap-2 bg-sand hover:bg-sand-dark text-white text-sm font-semibold px-9 py-4 rounded-full transition-all duration-200 hover:shadow-lg active:scale-95"
          >
            View All Properties
          </Link>
        </div>
      </section>
    </>
  );
}
