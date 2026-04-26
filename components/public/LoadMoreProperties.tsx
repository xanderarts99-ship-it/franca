"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import PropertyCard from "@/components/public/PropertyCard";

interface PropertyItem {
  id: string;
  name: string;
  location: string;
  nightlyRate: number;
  coverImageUrl: string;
  amenities: string[];
}

interface Props {
  initialProperties: PropertyItem[];
  total: number;
  startIndex: number;
}

export default function LoadMoreProperties({
  initialProperties,
  total,
  startIndex,
}: Props) {
  const [properties, setProperties] = useState(initialProperties);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(2);

  const remaining = total - startIndex - properties.length;
  const allLoaded = properties.length >= total - startIndex;

  async function loadMore() {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties?page=${page}&limit=6`);
      const data = await res.json() as { properties: PropertyItem[] };
      setProperties((prev) => [...prev, ...data.properties]);
      setPage((p) => p + 1);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {properties.map((property, i) => (
          <PropertyCard
            key={property.id}
            {...property}
            index={startIndex + i}
          />
        ))}
      </div>

      {!allLoaded && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full border border-warm-border bg-white hover:bg-cream text-sm font-semibold text-charcoal transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Loading…
              </>
            ) : (
              `Load More (${remaining} remaining)`
            )}
          </button>
        </div>
      )}
    </>
  );
}
