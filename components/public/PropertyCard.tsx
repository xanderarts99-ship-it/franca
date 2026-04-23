import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  id: string;
  name: string;
  location: string;
  nightlyRate: number;
  coverImageUrl: string | null;
  amenities: string[];
  index?: number;
  featured?: boolean;
}

const PLACEHOLDER_GRADIENTS = [
  "from-blue-800 via-blue-600 to-cyan-500",
  "from-amber-700 via-orange-600 to-amber-400",
  "from-emerald-800 via-teal-600 to-cyan-400",
  "from-rose-700 via-pink-600 to-rose-400",
  "from-violet-800 via-purple-600 to-indigo-400",
  "from-slate-700 via-blue-700 to-blue-500",
  "from-yellow-700 via-amber-500 to-yellow-400",
  "from-teal-700 via-green-600 to-emerald-400",
  "from-orange-700 via-red-600 to-rose-400",
  "from-sky-700 via-blue-500 to-cyan-400",
];

export default function PropertyCard({
  id,
  name,
  location,
  nightlyRate,
  coverImageUrl,
  amenities,
  index = 0,
  featured = false,
}: PropertyCardProps) {
  const gradient = PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length];
  const displayAmenities = amenities.slice(0, 3);

  if (featured) {
    return (
      <Link
        href={`/properties/${id}`}
        className="group flex flex-col md:flex-row h-full rounded-[var(--radius-card)] overflow-hidden border border-warm-border shadow-sm hover:shadow-2xl transition-all duration-500 bg-surface cursor-pointer"
      >
        {/* Image */}
        <div
          className="relative w-full md:w-3/5 overflow-hidden bg-cream-dark flex-shrink-0"
          style={{ minHeight: "280px" }}
        >
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority
            />
          ) : (
            <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)}>
              <div className="absolute inset-0 bg-black/20" />
              <span className="absolute inset-0 flex items-center justify-center font-serif text-white/25 text-7xl font-semibold">
                RV
              </span>
            </div>
          )}

          {/* Featured badge */}
          <div className="absolute top-4 left-4 bg-sand text-white text-[10px] font-semibold uppercase tracking-widest px-3.5 py-1.5 rounded-full z-10">
            Featured
          </div>

          {/* Bottom gradient */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />

          {/* Location */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 z-10">
            <MapPin size={12} className="text-white/70 flex-shrink-0" />
            <span className="text-xs text-white/90 font-medium">{location}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between p-7 md:p-9 md:w-2/5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-sand font-semibold mb-3">
              Premier Property
            </p>
            <h3 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal leading-snug group-hover:text-sand transition-colors duration-300">
              {name}
            </h3>

            {displayAmenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {displayAmenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="text-xs px-3 py-1.5 bg-sand-light text-sand-dark rounded-full font-medium"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-warm-border flex items-center justify-between gap-4">
            <div>
              <span className="font-serif text-3xl font-semibold text-charcoal">
                ${nightlyRate.toLocaleString()}
              </span>
              <span className="text-sm text-stone ml-1.5">/ night</span>
            </div>
            <span className="flex-shrink-0 inline-flex items-center bg-charcoal group-hover:bg-sand text-white text-[11px] font-semibold uppercase tracking-wider px-5 py-3 rounded-full transition-all duration-300">
              View Property
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/properties/${id}`}
      className="group block rounded-[var(--radius-card)] overflow-hidden border border-warm-border shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 bg-surface cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-dark">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)}>
            <div className="absolute inset-0 bg-black/20" />
            <span className="absolute inset-0 flex items-center justify-center font-serif text-white/25 text-5xl font-semibold">
              RV
            </span>
          </div>
        )}

        {/* Price badge */}
        <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-sm rounded-full px-3.5 py-1.5 shadow-sm">
          <span className="font-serif text-sm font-semibold text-charcoal">
            ${nightlyRate.toLocaleString()}
          </span>
          <span className="text-[11px] text-stone ml-0.5">/nt</span>
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />

        {/* Location in overlay */}
        <div className="absolute bottom-3.5 left-4 flex items-center gap-1.5">
          <MapPin size={11} className="text-white/65 flex-shrink-0" />
          <span className="text-[11px] text-white/85 font-medium">{location}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-4 pb-5">
        <h3 className="font-serif text-xl font-semibold text-charcoal leading-snug group-hover:text-sand transition-colors duration-200 line-clamp-2">
          {name}
        </h3>

        {displayAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {displayAmenities.map((amenity) => (
              <span
                key={amenity}
                className="text-xs px-2.5 py-1 bg-sand-light text-sand-dark rounded-full font-medium"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end mt-4 pt-4 border-t border-warm-border">
          <span className="text-xs font-semibold uppercase tracking-wider text-sand group-hover:translate-x-0.5 transition-transform duration-200">
            View Property →
          </span>
        </div>
      </div>
    </Link>
  );
}
