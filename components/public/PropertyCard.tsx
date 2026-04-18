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
}: PropertyCardProps) {
  const gradient = PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length];
  const displayAmenities = amenities.slice(0, 3);

  return (
    <Link
      href={`/properties/${id}`}
      className="group block bg-surface rounded-[var(--radius-card)] overflow-hidden border border-warm-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-dark">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br",
              gradient
            )}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif text-white/50 text-4xl font-semibold tracking-tight">
                RV
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Name */}
        <h3 className="font-serif text-xl font-semibold text-charcoal leading-snug group-hover:text-sand transition-colors duration-200">
          {name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <MapPin size={13} className="text-stone-light flex-shrink-0" />
          <span className="text-sm text-stone">{location}</span>
        </div>

        {/* Amenity tags */}
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

        {/* Price row */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-warm-border">
          <div>
            <span className="font-serif text-xl font-semibold text-charcoal">
              ${nightlyRate.toLocaleString()}
            </span>
            <span className="text-sm text-stone ml-1">/ night</span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sand group-hover:translate-x-0.5 transition-transform duration-200">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
