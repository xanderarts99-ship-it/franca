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

const REASON_STYLE: Record<Reason, { cell: string; dot: string; label: string }> = {
  BOOKING:  { cell: "bg-blue-100 text-blue-700",        dot: "bg-blue-400",   label: "Reservation" },
  PENDING:  { cell: "bg-stone-100 text-stone-500",      dot: "bg-stone-400",  label: "Pending payment" },
  MANUAL:   { cell: "bg-red-100 text-red-600",          dot: "bg-red-400",    label: "Manually blocked" },
  EXTERNAL: { cell: "bg-orange-100 text-orange-600",    dot: "bg-orange-400", label: "External (iCal)" },
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
  const [manualDates, setManualDates] = useState<Set<string>>(new Set());
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
    setSaving(key);
    // Optimistic update
    setManualDates((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    try {
      await fetch(`/api/admin/properties/${propertyId}/blocked-dates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: key }),
      });
    } catch {
      // revert on failure
      setManualDates((prev) => {
        const next = new Set(prev);
        next.has(key) ? next.delete(key) : next.add(key);
        return next;
      });
    } finally {
      setSaving(null);
    }
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

          const key       = toKey(year, month, day);
          const isPast    = key < today;
          const isToday   = key === today;
          const blocked   = blockedMap.get(key);
          const isManual  = manualDates.has(key);
          const isSaving  = saving === key;

          const effectiveReason: Reason | null = blocked?.reason ?? (isManual ? "MANUAL" : null);
          const style = effectiveReason ? REASON_STYLE[effectiveReason] : null;

          return (
            <div key={key} className="relative flex justify-center py-0.5">
              <button
                disabled={isPast || !!blocked || isSaving}
                onClick={() => toggleManual(key)}
                onMouseEnter={() => blocked && setTooltip({ key, info: blocked })}
                onMouseLeave={() => setTooltip(null)}
                className={cn(
                  "w-8 h-8 rounded-full text-xs flex items-center justify-center transition-all relative",
                  isPast && "text-stone-light/40 cursor-default",
                  !isPast && !effectiveReason && "text-charcoal hover:bg-[#FAFAF7] cursor-pointer",
                  style && style.cell,
                  isToday && "ring-2 ring-charcoal/20 font-semibold",
                  isSaving && "opacity-50 cursor-wait",
                  !isPast && !blocked && isManual && "ring-2 ring-red-300",
                )}
                aria-label={key}
              >
                {day}
              </button>

              {/* Tooltip */}
              {tooltip?.key === key && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 pointer-events-none">
                  <div className="bg-charcoal text-white text-[10px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                    {blocked?.label && <p className="font-semibold">{blocked.label}</p>}
                    {blocked?.bookingRef && (
                      <p className="text-white/60 font-mono">{blocked.bookingRef}</p>
                    )}
                    <p className="text-white/50">{REASON_STYLE[blocked!.reason].label}</p>
                  </div>
                  <div className="w-2 h-2 bg-charcoal rotate-45 mx-auto -mt-1" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Manual block tip */}
      <p className="text-[10px] text-stone-light mt-3 flex items-center gap-1.5">
        <Lock size={10} />
        Click an available date to manually block it.
        <Unlock size={10} className="ml-1" />
        Click a manually blocked date to unblock.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pt-4 border-t border-warm-border">
        {(Object.entries(REASON_STYLE) as [Reason, typeof REASON_STYLE[Reason]][]).map(
          ([, { dot, label }]) => (
            <div key={label} className="flex items-center gap-2 text-xs text-stone">
              <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", dot)} />
              {label}
            </div>
          )
        )}
      </div>
    </div>
  );
}
