"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Property {
  id: string;
  name: string;
}

interface ReviewsFilterProps {
  properties: Property[];
  currentPropertyId?: string;
  currentRating?: string;
  currentFeatured?: string;
}

export default function ReviewsFilter({
  properties,
  currentPropertyId,
  currentRating,
  currentFeatured,
}: ReviewsFilterProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const hasFilters = !!(currentPropertyId || currentRating || currentFeatured);

  function handleClear() {
    setLoading(true);
    router.push("/admin/reviews?tab=approved");
  }

  return (
    <form
      method="GET"
      onSubmit={() => setLoading(true)}
      className="flex flex-wrap items-center gap-3 mb-5"
    >
      <input type="hidden" name="tab" value="approved" />

      <select
        name="propertyId"
        defaultValue={currentPropertyId ?? ""}
        className="text-sm px-3 py-2 rounded-xl border border-warm-border bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-sand/40 cursor-pointer"
      >
        <option value="">All properties</option>
        {properties.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <select
        name="rating"
        defaultValue={currentRating ?? ""}
        className="text-sm px-3 py-2 rounded-xl border border-warm-border bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-sand/40 cursor-pointer"
      >
        <option value="">All ratings</option>
        {[5, 4, 3, 2, 1].map((r) => (
          <option key={r} value={r}>{r} star{r !== 1 ? "s" : ""}</option>
        ))}
      </select>

      <select
        name="featured"
        defaultValue={currentFeatured ?? ""}
        className="text-sm px-3 py-2 rounded-xl border border-warm-border bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-sand/40 cursor-pointer"
      >
        <option value="">All reviews</option>
        <option value="true">Featured only</option>
      </select>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sand text-white text-sm font-semibold hover:bg-sand-dark transition-all cursor-pointer disabled:opacity-60"
      >
        {loading && <Loader2 size={13} className="animate-spin" />}
        Filter
      </button>

      {hasFilters && (
        <button
          type="button"
          onClick={handleClear}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-warm-border text-sm text-stone hover:text-charcoal hover:bg-cream transition-all disabled:opacity-60 cursor-pointer"
        >
          {loading && <Loader2 size={13} className="animate-spin" />}
          Clear filters
        </button>
      )}
    </form>
  );
}
