import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Star, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPaginationParams, getPaginationMeta, getPrismaSkip } from "@/lib/pagination";
import ReviewsTable from "@/components/admin/ReviewsTable";
import PendingReviewsList from "@/components/admin/PendingReviewsList";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Reviews — Admin" };

interface PageProps {
  searchParams: Promise<{
    page?: string;
    propertyId?: string;
    featured?: string;
    rating?: string;
    tab?: string;
  }>;
}

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const tab = sp.tab === "pending" ? "pending" : "approved";
  const params = getPaginationParams(sp as Record<string, string>, 10);
  const propertyId = sp.propertyId ?? undefined;
  const featured   = sp.featured === "true" ? true : undefined;
  const rating     = sp.rating ? parseInt(sp.rating) : undefined;

  const approvedWhere = {
    approved: true,
    ...(propertyId ? { propertyId } : {}),
    ...(featured !== undefined ? { featured } : {}),
    ...(rating ? { rating } : {}),
  };

  const pendingCount = await prisma.review.count({ where: { approved: false } });

  if (tab === "pending") {
    const pendingReviews = await prisma.review.findMany({
      where: { approved: false },
      include: { property: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    });

    return (
      <div>
        <Header pendingCount={pendingCount} tab={tab} />
        <TabBar tab={tab} pendingCount={pendingCount} />
        <PendingReviewsList
          reviews={pendingReviews.map((r) => ({
            id: r.id,
            propertyName: r.property.name,
            guestName: r.guestName,
            guestLocation: r.guestLocation ?? null,
            rating: r.rating,
            comment: r.comment,
            reviewDate: r.reviewDate.toISOString(),
            hostResponse: (r as { hostResponse?: string | null }).hostResponse ?? null,
          }))}
        />
      </div>
    );
  }

  const [reviews, total, properties] = await Promise.all([
    prisma.review.findMany({
      where: approvedWhere,
      include: { property: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: getPrismaSkip(params),
      take: params.limit,
    }),
    prisma.review.count({ where: approvedWhere }),
    prisma.property.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const pagination    = getPaginationMeta(total, params);
  const showingFrom   = total === 0 ? 0 : getPrismaSkip(params) + 1;
  const showingTo     = Math.min(getPrismaSkip(params) + params.limit, total);

  return (
    <div>
      <Header pendingCount={pendingCount} tab={tab} />
      <TabBar tab={tab} pendingCount={pendingCount} />

      {/* Filters */}
      <form method="GET" className="flex flex-wrap items-center gap-3 mb-5">
        <input type="hidden" name="tab" value="approved" />
        <select
          name="propertyId"
          defaultValue={propertyId ?? ""}
          className="text-sm px-3 py-2 rounded-xl border border-warm-border bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-sand/40 cursor-pointer"
        >
          <option value="">All properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          name="rating"
          defaultValue={sp.rating ?? ""}
          className="text-sm px-3 py-2 rounded-xl border border-warm-border bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-sand/40 cursor-pointer"
        >
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>{r} star{r !== 1 ? "s" : ""}</option>
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
            href="/admin/reviews?tab=approved"
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

function Header({ pendingCount, tab }: { pendingCount: number; tab: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Reviews</h1>
        {pendingCount > 0 && tab !== "pending" && (
          <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
            <Clock size={11} />
            {pendingCount} pending approval
          </p>
        )}
      </div>
      <Link
        href="/admin/reviews/new"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-sand hover:bg-sand-dark text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-sand/30"
      >
        <Plus size={14} />
        Add Review
      </Link>
    </div>
  );
}

function TabBar({ tab, pendingCount }: { tab: string; pendingCount: number }) {
  return (
    <div className="flex items-center gap-1 mb-6 border-b border-warm-border">
      <Link
        href="/admin/reviews?tab=approved"
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
          tab === "approved"
            ? "border-sand text-sand"
            : "border-transparent text-stone hover:text-charcoal"
        )}
      >
        <Star size={13} />
        Approved
      </Link>
      <Link
        href="/admin/reviews?tab=pending"
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
          tab === "pending"
            ? "border-sand text-sand"
            : "border-transparent text-stone hover:text-charcoal"
        )}
      >
        <Clock size={13} />
        Pending Approval
        {pendingCount > 0 && (
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
            tab === "pending" ? "bg-sand/15 text-sand" : "bg-amber-100 text-amber-700"
          )}>
            {pendingCount}
          </span>
        )}
      </Link>
    </div>
  );
}
