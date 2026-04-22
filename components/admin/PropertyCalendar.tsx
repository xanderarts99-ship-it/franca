"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

type Reason = "BOOKING" | "MANUAL" | "EXTERNAL" | "PENDING";

interface BlockedDate {
  date: string;
  reason: Reason;
  label?: string;
  bookingRef?: string;
}

interface Props {
  propertyId: string;
  blockedDates: BlockedDate[];
}

const DAYS   = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const REASON_STYLE: Record<Reason, { cell: string; label: string }> = {
  BOOKING:  { cell: "bg-blue-100 text-blue-700",     label: "Reservation" },
  PENDING:  { cell: "bg-stone-100 text-stone-500",   label: "Pending payment" },
  MANUAL:   { cell: "bg-red-100 text-red-600",       label: "Manually blocked" },
  EXTERNAL: { cell: "bg-orange-100 text-orange-600", label: "External (iCal)" },
};

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function todayKey() {
  const d = new Date();
  return toKey(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function PropertyCalendar({ propertyId, blockedDates }: Props) {
  const now = new Date();
  const [offset, setOffset] = useState(0);
  // Dates blocked client-side this session (not yet in DB on initial load)
  const [clientBlocked, setClientBlocked] = useState<Set<string>>(new Set());
  // DB MANUAL dates that were unblocked this session (optimistic removal)
  const [locallyUnblocked, setLocallyUnblocked] = useState<Set<string>>(new Set());
  const [tooltip, setTooltip] = useState<{ key: string; info: BlockedDate } | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const viewDate  = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const year      = viewDate.getFullYear();
  const month     = viewDate.getMonth();
  const firstDow  = new Date(year, month, 1).getDay();
  const daysInMon = new Date(year, month + 1, 0).getDate();
  const today     = todayKey();

  const blockedMap = new Map<string, BlockedDate>(blockedDates.map((b) => [b.date, b]));

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMon }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  async function toggleManual(key: string) {
    const dbEntry = locallyUnblocked.has(key) ? undefined : blockedMap.get(key);
    const isDbManual = dbEntry?.reason === "MANUAL";
    const isClientManual = clientBlocked.has(key);
    const isCurrentlyBlocked = isDbManual || isClientManual;

    setSaving(key);

    if (isCurrentlyBlocked) {
      // Optimistic unblock
      if (isDbManual) {
        setLocallyUnblocked((prev) => new Set(prev).add(key));
      } else {
        setClientBlocked((prev) => { const next = new Set(prev); next.delete(key); return next; });
      }
      try {
        const res = await fetch(
          `/api/admin/properties/${propertyId}/blocked-dates`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: key }),
          }
        );
        if (!res.ok) throw new Error("Request failed");
      } catch {
        // Revert
        if (isDbManual) {
          setLocallyUnblocked((prev) => { const next = new Set(prev); next.delete(key); return next; });
        } else {
          setClientBlocked((prev) => new Set(prev).add(key));
        }
      }
    } else {
      // Optimistic block
      setClientBlocked((prev) => new Set(prev).add(key));
      try {
        const res = await fetch(
          `/api/admin/properties/${propertyId}/blocked-dates`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: key }),
          }
        );
        if (!res.ok) throw new Error("Request failed");
      } catch {
        // Revert
        setClientBlocked((prev) => { const next = new Set(prev); next.delete(key); return next; });
      }
    }

    setSaving(null);
  }

  return (
    <div className="bg-white border border-warm-border rounded-[var(--radius-card)] p-5">

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-serif text-lg font-semibold text-charcoal">
          {MONTHS[month]} {year}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOffset((o) => Math.max(0, o - 1))}
            disabled={offset === 0}
            className="p-1.5 rounded-full hover:bg-[#FAFAF7] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setOffset((o) => o + 1)}
            className="p-1.5 rounded-full hover:bg-[#FAFAF7] transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-stone-light uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;

          const key      = toKey(year, month, day);
          const isPast   = key < today;
          const isToday  = key === today;
          const isSaving = saving === key;

          // Effective DB entry (respects local unblocks)
          const dbEntry = locallyUnblocked.has(key) ? undefined : blockedMap.get(key);
          const isClientManual = clientBlocked.has(key);

          const effectiveReason: Reason | null =
            dbEntry?.reason ?? (isClientManual ? "MANUAL" : null);

          const style = effectiveReason ? REASON_STYLE[effectiveReason] : null;

          // Only MANUAL dates are clickable to toggle; BOOKING/EXTERNAL/PENDING are display-only
          const canToggle =
            !isPast &&
            !isSaving &&
            (effectiveReason === null || effectiveReason === "MANUAL");

          // Show tooltip for any blocked date (from DB, not client-added)
          const tooltipData = dbEntry;

          return (
            <div key={key} className="relative flex justify-center py-0.5">
              <button
                disabled={!canToggle}
                onClick={() => canToggle && toggleManual(key)}
                onMouseEnter={() => tooltipData && setTooltip({ key, info: tooltipData })}
                onMouseLeave={() => setTooltip(null)}
                className={cn(
                  "w-8 h-8 rounded-full text-xs flex items-center justify-center transition-all relative",
                  isPast && "text-stone-light/40 cursor-default",
                  !isPast && !effectiveReason && "text-charcoal hover:bg-[#FAFAF7] cursor-pointer",
                  effectiveReason === "BOOKING" || effectiveReason === "PENDING" || effectiveReason === "EXTERNAL"
                    ? "cursor-default"
                    : effectiveReason === "MANUAL" && canToggle
                    ? "cursor-pointer"
                    : "",
                  style && style.cell,
                  isToday && "ring-2 ring-charcoal/20 font-semibold",
                  isSaving && "opacity-50 cursor-wait",
                )}
                aria-label={key}
              >
                {day}
              </button>

              {/* Tooltip */}
              {tooltip?.key === key && tooltipData && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 pointer-events-none">
                  <div className="bg-charcoal text-white text-[10px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                    {tooltipData.label && <p className="font-semibold">{tooltipData.label}</p>}
                    {tooltipData.bookingRef && (
                      <p className="text-white/60 font-mono">{tooltipData.bookingRef}</p>
                    )}
                    <p className="text-white/50">{REASON_STYLE[tooltipData.reason].label}</p>
                  </div>
                  <div className="w-2 h-2 bg-charcoal rotate-45 mx-auto -mt-1" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Toggle tip */}
      <p className="text-[10px] text-stone-light mt-3 flex items-center gap-1.5">
        <Lock size={10} />
        Click an available date to manually block it.
        <Unlock size={10} className="ml-1" />
        Click a red date to unblock it.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pt-4 border-t border-warm-border">
        <span className="text-xs text-stone">🔵 Confirmed booking</span>
        <span className="text-xs text-stone">🔴 Manually blocked</span>
        <span className="text-xs text-stone">🟠 External booking</span>
        <span className="text-xs text-stone flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-stone-400 inline-block flex-shrink-0" />
          Pending payment
        </span>
      </div>
    </div>
  );
}
