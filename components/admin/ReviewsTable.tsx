"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Star, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Pagination from "@/components/shared/Pagination";
import type { PaginationMeta } from "@/lib/pagination";

interface ReviewRow {
  id: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  guestLocation: string | null;
  rating: number;
  comment: string;
  reviewDate: string;
  featured: boolean;
  createdAt: string;
}

interface Props {
  reviews: ReviewRow[];
  pagination: PaginationMeta & { showingFrom: number; showingTo: number };
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={11}
          className={i < rating ? "fill-amber-400 text-amber-400" : "text-stone-light/30"}
        />
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ReviewsTable({ reviews: initialReviews, pagination }: Props) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function toggleFeatured(id: string, current: boolean) {
    setTogglingId(id);
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, featured: !current } : r))
    );
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !current }),
      });
      startTransition(() => router.refresh());
    } catch {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, featured: current } : r))
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteReview(id: string) {
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r.id !== id));
      startTransition(() => router.refresh());
    } finally {
      setDeletingId(null);
    }
  }

  function handlePageChange(page: number) {
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(page));
    router.push(url.toString());
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white border border-warm-border rounded-card py-16 text-center text-stone text-sm">
        No reviews found.
      </div>
    );
  }

  const confirmTarget = reviews.find((r) => r.id === confirmDeleteId);

  return (
    <>
      {/* Delete confirmation modal */}
      {confirmDeleteId && confirmTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="bg-white rounded-card shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-red-50 border border-red-100 mb-4 mx-auto">
              <XCircle size={20} className="text-red-500" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-charcoal text-center mb-1">
              Delete this review?
            </h3>
            <p className="text-sm text-stone text-center mb-5">
              Review by <span className="font-semibold text-charcoal">{confirmTarget.guestName}</span> will be permanently deleted.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-full border border-warm-border text-charcoal text-sm font-semibold hover:bg-cream transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteReview(confirmDeleteId)}
                className="flex-1 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-warm-border rounded-card overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-border bg-[#FAFAF7]">
                {["Guest", "Property", "Rating", "Comment", "Date", "Featured", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-stone-light whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr
                  key={r.id}
                  className={cn(
                    "border-b border-warm-border last:border-0 hover:bg-[#FAFAF7] transition-colors",
                    deletingId === r.id && "opacity-40"
                  )}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-charcoal">{r.guestName}</p>
                    {r.guestLocation && (
                      <p className="text-xs text-stone-light">{r.guestLocation}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-charcoal whitespace-nowrap">{r.propertyName}</td>
                  <td className="px-5 py-3.5">
                    <Stars rating={r.rating} />
                  </td>
                  <td className="px-5 py-3.5 max-w-[220px]">
                    <p className="text-stone text-xs truncate">
                      {r.comment.slice(0, 80)}{r.comment.length > 80 ? "…" : ""}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-stone whitespace-nowrap text-xs">
                    {formatDate(r.reviewDate)}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleFeatured(r.id, r.featured)}
                      disabled={togglingId === r.id}
                      aria-label={r.featured ? "Remove from featured" : "Add to featured"}
                      className={cn(
                        "relative w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer shrink-0 disabled:opacity-50",
                        r.featured ? "bg-sand" : "bg-stone-200"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200",
                          r.featured ? "left-5" : "left-1"
                        )}
                      />
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/reviews/${r.id}/edit`}
                        className="w-7 h-7 rounded-lg border border-warm-border flex items-center justify-center text-stone hover:text-charcoal hover:bg-cream transition-colors cursor-pointer"
                        aria-label="Edit review"
                      >
                        <Pencil size={12} />
                      </Link>
                      <button
                        onClick={() => setConfirmDeleteId(r.id)}
                        disabled={deletingId === r.id}
                        aria-label="Delete review"
                        className="w-7 h-7 rounded-lg border border-red-100 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
                      >
                        {deletingId === r.id ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-warm-border">
          {reviews.map((r) => (
            <div key={r.id} className={cn("p-4", deletingId === r.id && "opacity-40")}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-medium text-charcoal text-sm">{r.guestName}</p>
                  {r.guestLocation && (
                    <p className="text-xs text-stone-light">{r.guestLocation}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleFeatured(r.id, r.featured)}
                    disabled={togglingId === r.id}
                    className={cn(
                      "relative w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer shrink-0 disabled:opacity-50",
                      r.featured ? "bg-sand" : "bg-stone-200"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200",
                        r.featured ? "left-5" : "left-1"
                      )}
                    />
                  </button>
                  <Link
                    href={`/admin/reviews/${r.id}/edit`}
                    className="w-7 h-7 rounded-lg border border-warm-border flex items-center justify-center text-stone hover:text-charcoal transition-colors cursor-pointer"
                  >
                    <Pencil size={12} />
                  </Link>
                  <button
                    onClick={() => setConfirmDeleteId(r.id)}
                    className="w-7 h-7 rounded-lg border border-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <Stars rating={r.rating} />
                <span className="text-xs text-stone">{r.propertyName}</span>
              </div>
              <p className="text-xs text-stone leading-relaxed mb-1">
                {r.comment.slice(0, 80)}{r.comment.length > 80 ? "…" : ""}
              </p>
              <p className="text-[10px] text-stone-light">{formatDate(r.reviewDate)}</p>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="px-5 py-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
            onPageChange={handlePageChange}
            showingFrom={pagination.showingFrom}
            showingTo={pagination.showingTo}
            total={pagination.total}
          />
        </div>
      </div>
    </>
  );
}
