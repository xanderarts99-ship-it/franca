import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, TrendingUp, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Bookings — Admin" };

type Status = "PENDING" | "CONFIRMED" | "CANCELLED";

interface MockBooking {
  id: string;
  bookingReference: string;
  status: Status;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  totalNights: number;
  totalAmount: number;
  createdAt: string;
}

const MOCK_BOOKINGS: MockBooking[] = [
  {
    id: "b1",
    bookingReference: "VR-2026-000001",
    status: "CONFIRMED",
    propertyName: "Oceanfront Villa",
    guestName: "Jane Smith",
    guestEmail: "jane@example.com",
    checkIn: "2026-08-01",
    checkOut: "2026-08-05",
    totalNights: 4,
    totalAmount: 1680,
    createdAt: "2026-04-10",
  },
  {
    id: "b2",
    bookingReference: "VR-2026-000002",
    status: "CONFIRMED",
    propertyName: "Mountain Chalet",
    guestName: "Marcus Webb",
    guestEmail: "marcus@example.com",
    checkIn: "2026-07-14",
    checkOut: "2026-07-21",
    totalNights: 7,
    totalAmount: 2660,
    createdAt: "2026-04-09",
  },
  {
    id: "b3",
    bookingReference: "VR-2026-000003",
    status: "PENDING",
    propertyName: "City Penthouse",
    guestName: "Priya Nair",
    guestEmail: "priya@example.com",
    checkIn: "2026-06-20",
    checkOut: "2026-06-23",
    totalNights: 3,
    totalAmount: 1650,
    createdAt: "2026-04-18",
  },
  {
    id: "b4",
    bookingReference: "VR-2026-000004",
    status: "CONFIRMED",
    propertyName: "Vineyard Estate",
    guestName: "Tom Hargreaves",
    guestEmail: "tom@example.com",
    checkIn: "2026-09-05",
    checkOut: "2026-09-10",
    totalNights: 5,
    totalAmount: 3100,
    createdAt: "2026-04-07",
  },
  {
    id: "b5",
    bookingReference: "VR-2026-000005",
    status: "CANCELLED",
    propertyName: "Tropical Bungalow",
    guestName: "Sofia Reyes",
    guestEmail: "sofia@example.com",
    checkIn: "2026-05-10",
    checkOut: "2026-05-14",
    totalNights: 4,
    totalAmount: 1180,
    createdAt: "2026-04-01",
  },
  {
    id: "b6",
    bookingReference: "VR-2026-000006",
    status: "CONFIRMED",
    propertyName: "Island Hideaway",
    guestName: "David Kim",
    guestEmail: "david@example.com",
    checkIn: "2026-10-01",
    checkOut: "2026-10-08",
    totalNights: 7,
    totalAmount: 4760,
    createdAt: "2026-04-15",
  },
];

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

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
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

export default function AdminBookingsPage() {
  const confirmed = MOCK_BOOKINGS.filter((b) => b.status === "CONFIRMED");
  const pending   = MOCK_BOOKINGS.filter((b) => b.status === "PENDING");
  const revenue   = confirmed.reduce((s, b) => s + b.totalAmount, 0);

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
              {MOCK_BOOKINGS.map((b) => (
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
                  <td className="px-5 py-3.5 text-charcoal whitespace-nowrap">{b.propertyName}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-stone">
                      <CalendarDays size={11} className="text-stone-light flex-shrink-0" />
                      <span>{formatDate(b.checkIn)}</span>
                      <span className="text-stone-light">→</span>
                      <span>{formatDate(b.checkOut)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-charcoal">{b.totalNights}</td>
                  <td className="px-5 py-3.5 font-semibold text-charcoal whitespace-nowrap">
                    ${b.totalAmount.toLocaleString()}
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
          {MOCK_BOOKINGS.map((b) => (
            <Link
              key={b.id}
              href={`/admin/bookings/${b.id}`}
              className="block px-4 py-4 hover:bg-[#FAFAF7] transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="font-mono text-xs font-semibold text-sand">
                  {b.bookingReference}
                </span>
                <StatusBadge status={b.status} />
              </div>
              <p className="font-medium text-charcoal text-sm">{b.guestName}</p>
              <p className="text-xs text-stone mb-2">{b.propertyName}</p>
              <div className="flex items-center justify-between text-xs text-stone">
                <span>
                  {formatDate(b.checkIn)} – {formatDate(b.checkOut)}
                </span>
                <span className="font-semibold text-charcoal">
                  ${b.totalAmount.toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
