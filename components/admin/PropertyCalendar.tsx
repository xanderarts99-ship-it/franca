"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Lock, Unlock, CalendarRange, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "availability" | "pricing";
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

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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

function getDatesInRange(a: string, b: string): string[] {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const t1 = new Date(ay, am - 1, ad).getTime();
  const t2 = new Date(by, bm - 1, bd).getTime();
  const start = Math.min(t1, t2);
  const end   = Math.max(t1, t2);
  const dates: string[] = [];
  for (let t = start; t <= end; t += 86_400_000) {
    const d = new Date(t);
    dates.push(toKey(d.getFullYear(), d.getMonth(), d.getDate()));
  }
  return dates;
}

function formatDateKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function PropertyCalendar({ propertyId, blockedDates }: Props) {
  const now = new Date();
  const [offset, setOffset] = useState(0);
  const [mode, setMode]     = useState<Mode>("availability");

  // ── Availability state ───────────────────────────────────
  const [clientBlocked, setClientBlocked]       = useState<Set<string>>(new Set());
  const [locallyUnblocked, setLocallyUnblocked] = useState<Set<string>>(new Set());
  const [tooltip, setTooltip] = useState<{ key: string; info: BlockedDate } | null>(null);
  const [saving, setSaving]   = useState<string | null>(null);

  // ── Pricing state ────────────────────────────────────────
  const [pricingMap, setPricingMap]     = useState<Map<string, number>>(new Map());
  const [baseRate, setBaseRate]         = useState(0);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Two-click range selection
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeHover, setRangeHover] = useState<string | null>(null);

  // Bulk price modal
  const [bulkDates, setBulkDates]   = useState<string[] | null>(null);
  const [bulkPrice, setBulkPrice]   = useState("");
  const [savingBulk, setSavingBulk] = useState(false);

  // ── Derived calendar values ──────────────────────────────
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

  // ── Fetch pricing for current month ─────────────────────
  useEffect(() => {
    if (mode !== "pricing") return;
    let cancelled = false;
    setPricingLoading(true);
    fetch(`/api/admin/properties/${propertyId}/pricing?month=${month + 1}&year=${year}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setBaseRate(data.baseRate ?? 0);
        const map = new Map<string, number>();
        for (const p of data.pricing ?? []) map.set(p.date, p.price);
        setPricingMap(map);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setPricingLoading(false); });
    return () => { cancelled = true; };
  }, [mode, year, month, propertyId]);

  // Clear hover preview when navigating months
  useEffect(() => { setRangeHover(null); }, [offset]);

  // ESC cancels an in-progress range selection
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && rangeStart) {
        setRangeStart(null);
        setRangeHover(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [rangeStart]);

  // Highlighted range based on current hover position
  const previewRange = useMemo(() => {
    if (!rangeStart) return new Set<string>();
    return new Set(getDatesInRange(rangeStart, rangeHover ?? rangeStart));
  }, [rangeStart, rangeHover]);

  // ── Availability: toggle manual block ───────────────────
  async function toggleManual(key: string) {
    const dbEntry        = locallyUnblocked.has(key) ? undefined : blockedMap.get(key);
    const isDbManual     = dbEntry?.reason === "MANUAL";
    const isClientManual = clientBlocked.has(key);
    const isBlocked      = isDbManual || isClientManual;
    setSaving(key);
    if (isBlocked) {
      if (isDbManual) setLocallyUnblocked((p) => new Set(p).add(key));
      else setClientBlocked((p) => { const n = new Set(p); n.delete(key); return n; });
      try {
        const r = await fetch(`/api/admin/properties/${propertyId}/blocked-dates`, {
          method: "DELETE", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: key }),
        });
        if (!r.ok) throw new Error();
      } catch {
        if (isDbManual) setLocallyUnblocked((p) => { const n = new Set(p); n.delete(key); return n; });
        else setClientBlocked((p) => new Set(p).add(key));
      }
    } else {
      setClientBlocked((p) => new Set(p).add(key));
      try {
        const r = await fetch(`/api/admin/properties/${propertyId}/blocked-dates`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: key }),
        });
        if (!r.ok) throw new Error();
      } catch {
        setClientBlocked((p) => { const n = new Set(p); n.delete(key); return n; });
      }
    }
    setSaving(null);
  }

  // ── Pricing: two-click range selection ──────────────────
  function handlePricingClick(key: string, isPast: boolean) {
    if (isPast) return;

    if (!rangeStart) {
      setRangeStart(key);
      setRangeHover(key);
      return;
    }

    // Second click — confirm range and open modal
    const tKey     = todayKey();
    const selected = getDatesInRange(rangeStart, key).filter((d) => d >= tKey);
    setRangeStart(null);
    setRangeHover(null);
    if (selected.length >= 1) {
      setBulkDates(selected);
      setBulkPrice("");
    }
  }

  function cancelRangeSelection() {
    setRangeStart(null);
    setRangeHover(null);
  }

  // ── Bulk price save / reset ──────────────────────────────
  async function saveBulkPrice() {
    if (!bulkDates?.length) return;
    const price = parseFloat(bulkPrice);
    if (isNaN(price) || price <= 0) return;
    setSavingBulk(true);
    try {
      const r = await fetch(`/api/admin/properties/${propertyId}/pricing/bulk`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: bulkDates, price }),
      });
      if (r.ok) {
        const ds = bulkDates;
        setPricingMap((prev) => { const m = new Map(prev); for (const d of ds) m.set(d, price); return m; });
        setBulkDates(null);
      }
    } finally {
      setSavingBulk(false);
    }
  }

  async function resetBulkPrice() {
    if (!bulkDates?.length) return;
    setSavingBulk(true);
    try {
      const r = await fetch(`/api/admin/properties/${propertyId}/pricing/bulk`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: bulkDates }),
      });
      if (r.ok) {
        const ds = bulkDates;
        setPricingMap((prev) => { const m = new Map(prev); for (const d of ds) m.delete(d); return m; });
        setBulkDates(null);
      }
    } finally {
      setSavingBulk(false);
    }
  }

  // ── Banner display helpers ───────────────────────────────
  const bannerEndDate  = rangeHover && rangeHover !== rangeStart ? rangeHover : null;
  const bannerNightCount = previewRange.size;

  return (
    <div className="bg-white border border-warm-border rounded-card p-4 sm:p-5">

      {/* ── Header: mode toggle + month nav ── */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex items-center bg-cream border border-warm-border rounded-full p-0.5">
          {(["availability", "pricing"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); cancelRangeSelection(); }}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all capitalize",
                mode === m ? "bg-charcoal text-white shadow-sm" : "text-stone hover:text-charcoal"
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <h2 className="font-serif text-base sm:text-lg font-semibold text-charcoal w-32 sm:w-36 text-center">
            {MONTHS[month]} {year}
          </h2>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setOffset((o) => Math.max(0, o - 1))}
              disabled={offset === 0}
              className="p-1.5 rounded-full hover:bg-cream transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setOffset((o) => o + 1)}
              className="p-1.5 rounded-full hover:bg-cream transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Day-of-week headers ── */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-stone-light uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      {/* ── Range-selection banner (pricing mode only) ── */}
      {mode === "pricing" && rangeStart && (
        <div className="flex items-center justify-between bg-sand/10 border border-sand/30 rounded-lg px-3 py-2 mb-2 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CalendarRange size={13} className="text-sand shrink-0" />
            <p className="text-xs text-charcoal truncate">
              <span className="font-semibold">{formatDateKey(rangeStart)}</span>
              {bannerEndDate ? (
                <>
                  {" → "}
                  <span className="font-semibold">{formatDateKey(bannerEndDate)}</span>
                  <span className="text-stone-light">
                    {" "}({bannerNightCount} night{bannerNightCount !== 1 ? "s" : ""})
                  </span>
                </>
              ) : (
                <span className="text-stone-light"> — now click an end date</span>
              )}
            </p>
          </div>
          <button
            onClick={cancelRangeSelection}
            className="text-stone-light hover:text-charcoal transition-colors shrink-0"
            aria-label="Cancel range selection"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── Availability grid ── */}
      {mode === "availability" && (
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} />;
            const key            = toKey(year, month, day);
            const isPast         = key < today;
            const isToday        = key === today;
            const isSaving       = saving === key;
            const dbEntry        = locallyUnblocked.has(key) ? undefined : blockedMap.get(key);
            const isClientManual = clientBlocked.has(key);
            const effectiveReason: Reason | null =
              dbEntry?.reason ?? (isClientManual ? "MANUAL" : null);
            const style     = effectiveReason ? REASON_STYLE[effectiveReason] : null;
            const canToggle =
              !isPast && !isSaving &&
              (effectiveReason === null || effectiveReason === "MANUAL");

            return (
              <div key={key} className="relative flex justify-center py-0.5">
                <button
                  disabled={!canToggle}
                  onClick={() => canToggle && toggleManual(key)}
                  onMouseEnter={() => dbEntry && setTooltip({ key, info: dbEntry })}
                  onMouseLeave={() => setTooltip(null)}
                  className={cn(
                    "w-8 h-8 rounded-full text-xs flex items-center justify-center transition-all",
                    isPast && "text-stone-light/40 cursor-default",
                    !isPast && !effectiveReason && "text-charcoal hover:bg-cream cursor-pointer",
                    (effectiveReason === "BOOKING" || effectiveReason === "PENDING" || effectiveReason === "EXTERNAL")
                      ? "cursor-default"
                      : effectiveReason === "MANUAL" && canToggle ? "cursor-pointer" : "",
                    style?.cell,
                    isToday && "ring-2 ring-charcoal/20 font-semibold",
                    isSaving && "opacity-50 cursor-wait",
                  )}
                  aria-label={key}
                >
                  {day}
                </button>

                {tooltip?.key === key && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 pointer-events-none">
                    <div className="bg-charcoal text-white text-[10px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                      {tooltip.info.label && <p className="font-semibold">{tooltip.info.label}</p>}
                      {tooltip.info.bookingRef && (
                        <p className="text-white/60 font-mono">{tooltip.info.bookingRef}</p>
                      )}
                      <p className="text-white/50">{REASON_STYLE[tooltip.info.reason].label}</p>
                    </div>
                    <div className="w-2 h-2 bg-charcoal rotate-45 mx-auto -mt-1" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pricing grid ── */}
      {mode === "pricing" && (
        <div
          className={cn(
            "grid grid-cols-7 gap-y-0.5 select-none",
            pricingLoading && "opacity-60 pointer-events-none"
          )}
          onMouseLeave={() => rangeStart && setRangeHover(null)}
        >
          {cells.map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} />;
            const key          = toKey(year, month, day);
            const isPast       = key < today;
            const isToday      = key === today;
            const hasCustom    = pricingMap.has(key);
            const price        = pricingMap.get(key) ?? baseRate;
            const isRangeStart = rangeStart === key;
            const isInPreview  = previewRange.has(key);

            return (
              <div key={key} className="relative flex justify-center py-0.5">
                <button
                  onClick={() => handlePricingClick(key, isPast)}
                  onMouseEnter={() => { if (rangeStart && !isPast) setRangeHover(key); }}
                  disabled={isPast}
                  className={cn(
                    "w-full h-11 rounded-lg flex flex-col items-center justify-center transition-colors",
                    isPast  && "opacity-30 cursor-default",
                    !isPast && "cursor-pointer",
                    isToday && !isPast && "ring-1 ring-charcoal/20",
                    // Range selection states take priority over custom-price highlight
                    isRangeStart                                   && "bg-sand",
                    isInPreview && !isRangeStart                   && "bg-sand/20",
                    // Custom price (only when not currently in range preview)
                    hasCustom && !isPast && !isInPreview && !isRangeStart && "bg-amber-50",
                    // Default hover
                    !isPast && !isInPreview && !isRangeStart && !hasCustom && "hover:bg-cream",
                  )}
                  aria-label={key}
                >
                  <span className={cn(
                    "text-[11px] font-medium leading-none",
                    isRangeStart                     ? "text-white"
                    : hasCustom && !isPast && !isInPreview ? "text-amber-700"
                    : "text-charcoal"
                  )}>
                    {day}
                  </span>
                  {!isPast && (
                    <span className={cn(
                      "text-[9px] leading-none mt-0.5",
                      isRangeStart              ? "text-white/70"
                      : isInPreview             ? "text-sand font-semibold"
                      : hasCustom               ? "text-amber-600 font-semibold"
                      : "text-stone-light"
                    )}>
                      ${price}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Availability legend ── */}
      {mode === "availability" && (
        <>
          <p className="text-[10px] text-stone-light mt-3 flex items-center gap-1.5 flex-wrap">
            <Lock size={10} />
            Click an available date to manually block it.
            <Unlock size={10} className="ml-1" />
            Click a red date to unblock it.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pt-4 border-t border-warm-border">
            {[
              { color: "bg-blue-200",   label: "Confirmed booking" },
              { color: "bg-red-200",    label: "Manually blocked" },
              { color: "bg-orange-200", label: "External booking" },
              { color: "bg-stone-200",  label: "Pending payment" },
            ].map(({ color, label }) => (
              <span key={label} className="text-xs text-stone flex items-center gap-1.5">
                <span className={cn("w-2.5 h-2.5 rounded-full inline-block shrink-0", color)} />
                {label}
              </span>
            ))}
          </div>
        </>
      )}

      {/* ── Pricing legend ── */}
      {mode === "pricing" && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pt-4 border-t border-warm-border">
          <span className="text-xs text-stone flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded inline-block shrink-0 bg-amber-100 border border-amber-300" />
            Custom price
          </span>
          <span className="text-xs text-stone flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded inline-block shrink-0 bg-cream border border-warm-border" />
            Base rate (${baseRate}/night)
          </span>
          <span className="text-xs text-stone-light sm:ml-auto">
            Click a start date, then click an end date · Esc to cancel
          </span>
        </div>
      )}

      {/* ── Bulk price modal ── */}
      {bulkDates && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setBulkDates(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 w-full sm:max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg font-semibold text-charcoal">
                  Set price for {bulkDates.length} night{bulkDates.length !== 1 ? "s" : ""}
                </h3>
                <p className="text-xs text-stone mt-0.5">
                  {bulkDates.length === 1
                    ? formatDateKey(bulkDates[0])
                    : `${formatDateKey(bulkDates[0])} – ${formatDateKey(bulkDates[bulkDates.length - 1])}`}
                </p>
              </div>
              <button
                onClick={() => setBulkDates(null)}
                className="text-stone-light hover:text-charcoal transition-colors mt-0.5"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center border border-warm-border rounded-xl overflow-hidden mb-5 bg-cream focus-within:ring-2 focus-within:ring-sand">
              <span className="px-3 text-stone text-sm font-medium">$</span>
              <input
                autoFocus
                type="number"
                min="1"
                step="1"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveBulkPrice();
                  if (e.key === "Escape") setBulkDates(null);
                }}
                placeholder={String(baseRate)}
                className="flex-1 py-3 text-sm text-charcoal bg-transparent focus:outline-none pr-3"
              />
              <span className="px-3 text-stone-light text-xs">per night</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={saveBulkPrice}
                disabled={savingBulk || !bulkPrice.trim()}
                className="flex-1 py-3 bg-sand text-white text-sm font-semibold rounded-full disabled:opacity-50 hover:bg-sand-dark transition-colors"
              >
                {savingBulk ? "Saving…" : "Apply"}
              </button>
              <button
                onClick={resetBulkPrice}
                disabled={savingBulk}
                title="Reset all to base rate"
                className="px-5 py-3 border border-warm-border text-stone text-sm rounded-full hover:bg-cream transition-colors disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
