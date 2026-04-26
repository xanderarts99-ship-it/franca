import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPaginationParams, getPaginationMeta, getPrismaSkip } from "@/lib/pagination";
import ReviewsTable from "@/components/admin/ReviewsTable";

export const metadata: Metadata = { title: "Reviews — Admin" };

interface PageProps {
  searchParams: Promise<{ page?: string; propertyId?: string; featured?: string; rating?: string }>;
}

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const params = getPaginationParams(sp as Record<string, string>, 10);
  const propertyId = sp.propertyId ?? undefined;
  const featured = sp.featured === "true" ? true : undefined;
  const rating = sp.rating ? parseInt(sp.rating) : undefined;

  const where = {
    ...(propertyId ? { propertyId } : {}),
    ...(featured !== undefined ? { featured } : {}),
    ...(rating ? { rating } : {}),
  };

  const [reviews, total, properties] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { property: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: getPrismaSkip(params),
      take: params.limit,
    }),
    prisma.review.count({ where }),
    prisma.property.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const pagination = getPaginationMeta(total, params);
  const showingFrom = total === 0 ? 0 : getPrismaSkip(params) + 1;
  const showingTo = Math.min(getPrismaSkip(params) + params.limit, total);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-charcoal">Reviews</h1>
          <p className="text-stone text-sm mt-0.5">
            {total} review{total !== 1 ? "s" : ""} · manage guest testimonials.
          </p>
        </div>
        <Link
          href="/admin/reviews/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-sand hover:bg-sand-dark text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-sand/30"
        >
          <Plus size={14} />
          Add Review
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap items-center gap-3 mb-5">
        <select
          name="propertyId"
          defaultValue={propertyId ?? ""}
          className="text-sm px-3 py-2 rounded-xl border border-warm-border bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-sand/40 cursor-pointer"
        >
          <option value="">All properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          name="rating"
          defaultValue={sp.rating ?? ""}
          className="text-sm px-3 py-2 rounded-xl border border-warm-border bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-sand/40 cursor-pointer"
        >
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} star{r !== 1 ? "s" : ""}
            </option>
          ))}
        </select>

        <select
          name="featured"
          defaultValue={sp.featured ?? ""}
          className="text-sm px-3 py-2 rounded-xl border border-warm-border bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-sand/40 cursor-pointer"
        >
          <option value="">All reviews</option>
          <option value="true">Featured only</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-sand text-white text-sm font-semibold hover:bg-sand-dark transition-all cursor-pointer"
        >
          Filter
        </button>

        {(propertyId || sp.rating || sp.featured) && (
          <Link
            href="/admin/reviews"
            className="px-4 py-2 rounded-xl border border-warm-border text-sm text-stone hover:text-charcoal hover:bg-cream transition-all"
          >
            Clear
          </Link>
        )}
      </form>

      <ReviewsTable
        reviews={reviews.map((r) => ({
          id: r.id,
          propertyId: r.propertyId,
          propertyName: r.property.name,
          guestName: r.guestName,
          guestLocation: r.guestLocation ?? null,
          rating: r.rating,
          comment: r.comment,
          reviewDate: r.reviewDate.toISOString(),
          featured: r.featured,
          createdAt: r.createdAt.toISOString(),
        }))}
        pagination={{ ...pagination, showingFrom, showingTo }}
      />
    </div>
  );
}
