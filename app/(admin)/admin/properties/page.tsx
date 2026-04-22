import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Pencil, CalendarDays, DollarSign } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Properties — Admin" };

/* One of 10 subtle gradients keyed by index — matches PropertyCard.tsx */
const GRADIENTS = [
  "linear-gradient(135deg, #0F2945 0%, #1B3A6B 100%)",
  "linear-gradient(135deg, #2D4A3E 0%, #4A7A66 100%)",
  "linear-gradient(135deg, #4A2D1A 0%, #8B5E3C 100%)",
  "linear-gradient(135deg, #3D2B4A 0%, #6B4A7A 100%)",
  "linear-gradient(135deg, #1A3A4A 0%, #2E6B7A 100%)",
  "linear-gradient(135deg, #4A3B1A 0%, #8B6E2E 100%)",
  "linear-gradient(135deg, #1A2D4A 0%, #2E4E8B 100%)",
  "linear-gradient(135deg, #3A4A1A 0%, #6B8B2E 100%)",
  "linear-gradient(135deg, #4A1A2D 0%, #8B2E5E 100%)",
  "linear-gradient(135deg, #1A4A3A 0%, #2E8B6B 100%)",
];

export default async function AdminPropertiesPage() {
  const properties = await prisma.property.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      nightlyRate: true,
      amenities: true,
      images: true,
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      {/* Page heading */}
      <div className="mb-7">
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Properties</h1>
        <p className="text-stone text-sm mt-0.5">
          {properties.length} properties · manage listings, rates, and calendars.
        </p>
      </div>

      {/* Property grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {properties.map((property, idx) => (
          <div
            key={property.id}
            className="bg-white border border-warm-border rounded-[var(--radius-card)] overflow-hidden group"
          >
            {/* Thumbnail */}
            <div className="h-36 w-full relative overflow-hidden">
              {property.images[0] ? (
                <Image
                  src={property.images[0]}
                  alt={property.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
              ) : (
                <div
                  className="h-full w-full relative"
                  style={{ background: GRADIENTS[idx % GRADIENTS.length] }}
                >
                  <div className="absolute inset-0 bg-black/10" />
                  <span className="absolute inset-0 flex items-center justify-center font-serif text-white/20 text-4xl font-semibold select-none">
                    RV
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-serif text-base font-semibold text-charcoal leading-tight mb-1">
                {property.name}
              </h3>

              <div className="flex items-center gap-1.5 mb-3">
                <MapPin size={11} className="text-stone-light shrink-0" />
                <span className="text-xs text-stone">{property.location}</span>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-4 mb-4 text-xs text-stone">
                <div className="flex items-center gap-1">
                  <DollarSign size={10} className="text-stone-light" />
                  <span>
                    <span className="font-semibold text-charcoal">
                      ${Number(property.nightlyRate).toLocaleString()}
                    </span>{" "}
                    / night
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarDays size={10} className="text-stone-light" />
                  <span>
                    <span className="font-semibold text-charcoal">{property._count.bookings}</span>{" "}
                    bookings
                  </span>
                </div>
              </div>

              {/* Amenity pills — first 3 */}
              <div className="flex flex-wrap gap-1 mb-4">
                {property.amenities.slice(0, 3).map((a) => (
                  <span
                    key={a}
                    className="px-2 py-0.5 bg-[#FAFAF7] border border-warm-border rounded-full text-[10px] text-stone font-medium"
                  >
                    {a}
                  </span>
                ))}
                {property.amenities.length > 3 && (
                  <span className="px-2 py-0.5 bg-[#FAFAF7] border border-warm-border rounded-full text-[10px] text-stone-light font-medium">
                    +{property.amenities.length - 3} more
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t border-warm-border pt-3">
                <Link
                  href={`/admin/properties/${property.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full border border-warm-border bg-[#FAFAF7] hover:bg-cream text-xs font-semibold text-charcoal transition-all"
                >
                  <Pencil size={11} />
                  Edit
                </Link>
                <Link
                  href={`/admin/properties/${property.id}/calendar`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full border border-sand/30 bg-sand/8 hover:bg-sand/15 text-xs font-semibold text-sand transition-all"
                >
                  <CalendarDays size={11} />
                  Calendar
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
