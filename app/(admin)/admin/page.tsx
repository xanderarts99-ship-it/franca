import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, TrendingUp, Clock, CheckCircle2, XCircle, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { expireStaleBookings } from "@/lib/bookings";
import { getPaginationParams, getPaginationMeta, getPrismaSkip } from "@/lib/pagination";
import PaginationNav from "@/components/shared/PaginationNav";
import BookingsTabBar from "@/components/admin/BookingsTabBar";
import type { BookingStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Bookings — Admin" };

type DisplayStatus = "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "PENDING";

const STATUS_CONFIG: Record<DisplayStatus, { label: string; className: string; icon: React.ElementType }> = {
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: CheckCircle2,
  },
  PENDING_PAYMENT: {
    label: "Awaiting Payment",
    className: "bg-amber-50 text-amber-700 border-amber-100",
    icon: Clock,
  },
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-100",
    icon: Clock,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-50 text-red-600 border-red-100",
    icon: XCircle,
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-stone-100 text-stone-500 border-stone-200",
    icon: Ban,
  },
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status as DisplayStatus] ?? STATUS_CONFIG.CANCELLED;
  const { label, className, icon: Icon } = cfg;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border",
        className
      )}
    >
      <Icon size={10} />
      {label}
    </span>
  );
}

type Tab = "all" | "pending" | "confirmed" | "closed";

interface PageProps {
  searchParams: Promise<{ tab?: string; page?: string; limit?: string }>;
}

export default async function AdminBookingsPage({ searchParams }: PageProps) {
  await expireStaleBookings().catch((err) =>
    console.error("expireStaleBookings error:", err)
  );

  const sp = await searchParams;
  const { tab = "all" } = sp;
  const activeTab = (["all", "pending", "confirmed", "closed"].includes(tab) ? tab : "all") as Tab;

  const params = getPaginationParams(sp as Record<string, string>, 15);

  const statusFilter: BookingStatus[] | undefined =
    activeTab === "pending" ? ["PENDING_PAYMENT"]
    : activeTab === "confirmed" ? ["CONFIRMED"]
    : activeTab === "closed" ? ["CANCELLED", "EXPIRED"]
    : undefined;

  const where = statusFilter ? { status: { in: statusFilter } } : {};

  const [bookings, total, pendingCount, confirmedCount] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: { property: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: getPrismaSkip(params),
      take: params.limit,
    }),
    prisma.booking.count({ where }),
    prisma.booking.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
  ]);

  const revenue = (
    await prisma.booking.findMany({
      where: { status: "CONFIRMED" },
      select: { totalAmount: true },
    })
  ).reduce((s, b) => s + Number(b.totalAmount), 0);

  const pagination = getPaginationMeta(total, params);
  const showingFrom = total === 0 ? 0 : getPrismaSkip(params) + 1;
  const showingTo = Math.min(getPrismaSkip(params) + params.limit, total);

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending", count: pendingCount },
    { key: "confirmed", label: "Confirmed", count: confirmedCount },
    { key: "closed", label: "Cancelled / Expired" },
  ];

  return (
    <div>
      {/* Page heading */}
      <div className="mb-7">
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Bookings</h1>
        <p className="text-stone text-sm mt-0.5">All guest reservations, newest first.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
        <div className="bg-white border border-warm-border rounded-[var(--radius-card)] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-light">Revenue</p>
            <TrendingUp size={14} className="text-emerald-500" />
          </div>
          <p className="font-serif text-2xl font-semibold text-charcoal">
            ${revenue.toLocaleString()}
          </p>
          <p className="text-xs text-stone mt-0.5">from confirmed bookings</p>
        </div>

        <div className="bg-white border border-warm-border rounded-[var(--radius-card)] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-light">Confirmed</p>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
          <p className="font-serif text-2xl font-semibold text-charcoal">{confirmedCount}</p>
          <p className="text-xs text-stone mt-0.5">active reservations</p>
        </div>

        <div className={cn(
          "border rounded-[var(--radius-card)] p-4",
          pendingCount > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-warm-border"
        )}>
          <div className="flex items-center justify-between mb-3">
            <p className={cn(
              "text-xs font-semibold uppercase tracking-wider",
              pendingCount > 0 ? "text-amber-700" : "text-stone-light"
            )}>
              Awaiting Payment
            </p>
            <Clock size={14} className={pendingCount > 0 ? "text-amber-500" : "text-stone-light"} />
          </div>
          <p className={cn(
            "font-serif text-2xl font-semibold",
            pendingCount > 0 ? "text-amber-800" : "text-charcoal"
          )}>
            {pendingCount}
          </p>
          <p className={cn("text-xs mt-0.5", pendingCount > 0 ? "text-amber-700 font-medium" : "text-stone")}>
            {pendingCount > 0 ? "require your action" : "no pending requests"}
          </p>
        </div>
      </div>

      {/* Tab filter */}
      <BookingsTabBar tabs={tabs} activeTab={activeTab} />

      {/* Table card */}
      <div className="bg-white border border-warm-border rounded-[var(--radius-card)] overflow-hidden">
        {bookings.length === 0 ? (
          <div className="py-16 text-center text-stone text-sm">
            No bookings in this category.
          </div>
        ) : (
          <>
            {/* Table — desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-warm-border bg-[#FAFAF7]">
                    {["Reference", "Guest", "Property", "Dates", "Nights", "Total", "Status"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-stone-light whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr
                      key={b.id}
                      className={cn(
                        "border-b border-warm-border last:border-0 hover:bg-[#FAFAF7] transition-colors",
                        b.status === "PENDING_PAYMENT" && "bg-amber-50/40"
                      )}
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="font-mono text-xs font-semibold text-sand hover:text-sand-dark transition-colors"
                        >
                          {b.bookingReference}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-charcoal">{b.guestName}</p>
                        <p className="text-xs text-stone-light">{b.guestEmail}</p>
                      </td>
                      <td className="px-5 py-3.5 text-charcoal whitespace-nowrap">{b.property.name}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-stone">
                          <CalendarDays size={11} className="text-stone-light shrink-0" />
                          <span>{formatDate(b.checkIn)}</span>
                          <span className="text-stone-light">→</span>
                          <span>{formatDate(b.checkOut)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-charcoal">{b.totalNights}</td>
                      <td className="px-5 py-3.5 font-semibold text-charcoal whitespace-nowrap">
                        ${Number(b.totalAmount).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards — mobile */}
            <div className="md:hidden divide-y divide-warm-border">
              {bookings.map((b) => (
                <Link
                  key={b.id}
                  href={`/admin/bookings/${b.id}`}
                  className={cn(
                    "block px-4 py-4 hover:bg-[#FAFAF7] transition-colors",
                    b.status === "PENDING_PAYMENT" && "bg-amber-50/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-semibold text-sand">
                      {b.bookingReference}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="font-medium text-charcoal text-sm">{b.guestName}</p>
                  <p className="text-xs text-stone mb-2">{b.property.name}</p>
                  <div className="flex items-center justify-between text-xs text-stone">
                    <span>
                      {formatDate(b.checkIn)} – {formatDate(b.checkOut)}
                    </span>
                    <span className="font-semibold text-charcoal">
                      ${Number(b.totalAmount).toLocaleString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="px-5 py-4">
              <PaginationNav
                pagination={pagination}
                showingFrom={showingFrom}
                showingTo={showingTo}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
