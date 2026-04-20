import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, TrendingUp, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Bookings — Admin" };

type Status = "PENDING" | "CONFIRMED" | "CANCELLED";

const STATUS_CONFIG: Record<Status, { label: string; className: string; icon: React.ElementType }> = {
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: CheckCircle2,
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
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: Status }) {
  const { label, className, icon: Icon } = STATUS_CONFIG[status];
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

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      property: { select: { name: true } },
    },
    orderBy: { checkIn: "asc" },
  });

  const confirmed = bookings.filter((b) => b.status === "CONFIRMED");
  const pending   = bookings.filter((b) => b.status === "PENDING");
  const revenue   = confirmed.reduce((s, b) => s + Number(b.totalAmount), 0);

  return (
    <div>
      {/* Page heading */}
      <div className="mb-7">
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Bookings</h1>
        <p className="text-stone text-sm mt-0.5">All guest reservations, sorted by check-in.</p>
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
          <p className="font-serif text-2xl font-semibold text-charcoal">{confirmed.length}</p>
          <p className="text-xs text-stone mt-0.5">active reservations</p>
        </div>

        <div className="bg-white border border-warm-border rounded-[var(--radius-card)] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-light">Pending</p>
            <Clock size={14} className="text-amber-500" />
          </div>
          <p className="font-serif text-2xl font-semibold text-charcoal">{pending.length}</p>
          <p className="text-xs text-stone mt-0.5">awaiting payment</p>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white border border-warm-border rounded-[var(--radius-card)] overflow-hidden">

        {bookings.length === 0 ? (
          <div className="py-16 text-center text-stone text-sm">
            No bookings yet.
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
                      className="border-b border-warm-border last:border-0 hover:bg-[#FAFAF7] transition-colors"
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
                        <StatusBadge status={b.status as Status} />
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
                  className="block px-4 py-4 hover:bg-[#FAFAF7] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-semibold text-sand">
                      {b.bookingReference}
                    </span>
                    <StatusBadge status={b.status as Status} />
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
          </>
        )}
      </div>
    </div>
  );
}
