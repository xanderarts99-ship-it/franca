"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  showingFrom: number;
  showingTo: number;
  total: number;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  showingFrom,
  showingTo,
  total,
}: Props) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-warm-border">
      {/* Count */}
      <p className="text-xs text-stone">
        Showing{" "}
        <span className="font-semibold text-charcoal">{showingFrom}–{showingTo}</span>{" "}
        of{" "}
        <span className="font-semibold text-charcoal">{total}</span> results
      </p>

      {/* Mobile: prev / indicator / next */}
      <div className="flex sm:hidden items-center gap-3">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          aria-label="Previous page"
          className="w-9 h-9 rounded-xl border border-warm-border flex items-center justify-center text-charcoal hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="text-xs text-stone">
          Page <span className="font-semibold text-charcoal">{currentPage}</span> of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          aria-label="Next page"
          className="w-9 h-9 rounded-xl border border-warm-border flex items-center justify-center text-charcoal hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Desktop: full pagination */}
      <div className="hidden sm:flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          aria-label="Previous page"
          className="w-8 h-8 rounded-lg border border-warm-border flex items-center justify-center text-charcoal hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-stone-light">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              aria-current={p === currentPage ? "page" : undefined}
              className={cn(
                "w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                p === currentPage
                  ? "bg-sand text-white shadow-sm"
                  : "border border-warm-border text-charcoal hover:bg-cream"
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          aria-label="Next page"
          className="w-8 h-8 rounded-lg border border-warm-border flex items-center justify-center text-charcoal hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
