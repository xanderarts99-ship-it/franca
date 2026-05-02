"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Lock, Unlock, RotateCcw, X } from "lucide-react";
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
    dates.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }
  return dates;
}

export default function PropertyCalendar({ propertyId, blockedDates }: Props) {
  const now = new Date();
  const [offset, setOffset] = useState(0);
  const [mode, setMode] = useState<Mode>("availability");

  // ── Availability mode ────────────────────────────────────
  const [clientBlocked, setClientBlocked]     = useState<Set<string>>(new Set());
  const [locallyUnblocked, setLocallyUnblocked] = useState<Set<string>>(new Set());
  const [tooltip, setTooltip]   = useState<{ key: string; info: BlockedDate } | null>(null);
  const [saving, setSaving]     = useState<string | null>(null);

  // ── Pricing mode ─────────────────────────────────────────
  const [pricingMap, setPricingMap]   = useState<Map<string, number>>(new Map());
  const [baseRate, setBaseRate]       = useState(0);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editPrice, setEditPrice]     = useState("");
  const [savingPrice, setSavingPrice] = useState(false);

  // Drag selection (pricing mode)
  const dragStartRef  = useRef<string | null>(null);
  const hasDraggedRef = useRef(false);
  const [isDragging, setIsDragging]   = useState(false);
  const [dragCurrent, setDragCurrent] = useState<string | null>(null);
  const [bulkDates, setBulkDates]     = useState<string[] | null>(null);
  const [bulkPrice, setBulkPrice]     = useState("");
  const [savingBulk, setSavingBulk]   = useState(false);

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

  // ── Global mouseup to finalize drag ─────────────────────
  useEffect(() => {
    function onMouseUp() {
      if (!isDragging) return;
      setIsDragging(false);
      if (hasDraggedRef.current && dragStartRef.current && dragCurrent) {
        const tKey = todayKey();
        const futureDates = getDatesInRange(dragStartRef.current, dragCurrent).filter(
          (d) => d >= tKey
        );
        if (futureDates.length > 1) {
          setBulkDates(futureDates);
          setBulkPrice("");
        }
      }
      dragStartRef.current = null;
      setDragCurrent(null);
    }
    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, [isDragging, dragCurrent]);

  // ── Availability: toggle manual block ───────────────────
  async function toggleManual(key: string) {
    const dbEntry      = locallyUnblocked.has(key) ? undefined : blockedMap.get(key);
    const isDbManual   = dbEntry?.reason === "MANUAL";
    const isClientManual = clientBlocked.has(key);
    const isBlocked    = isDbManual || isClientManual;
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

  // ── Pricing mode interactions ────────────────────────────
  function handlePriceMouseDown(key: string, isPast: boolean) {
    if (isPast) return;
    dragStartRef.current  = key;
    hasDraggedRef.current = false;
    setIsDragging(true);
    setDragCurrent(key);
  }

  function handlePriceMouseEnter(key: string) {
    if (!isDragging || !dragStartRef.current) return;
    if (key !== dragStartRef.current) hasDraggedRef.current = true;
    setDragCurrent(key);
  }

  function handlePriceClick(key: string, isPast: boolean) {
    if (isPast || hasDraggedRef.current) return;
    if (editingDate === key) { setEditingDate(null); return; }
    setEditingDate(key);
    setEditPrice(pricingMap.has(key) ? String(pricingMap.get(key)) : "");
  }

  async function savePrice() {
    if (!editingDate) return;
    const price = parseFloat(editPrice);
    if (isNaN(price) || price <= 0) return;
    setSavingPrice(true);
    try {
      const r = await fetch(`/api/admin/properties/${propertyId}/pricing`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: editingDate, price }),
      });
      if (r.ok) {
        const d = editingDate;
        setPricingMap((prev) => { const m = new Map(prev); m.set(d, price); return m; });
        setEditingDate(null);
      }
    } finally {
      setSavingPrice(false);
    }
  }

  async function resetPrice() {
    if (!editingDate) return;
    setSavingPrice(true);
    try {
      const r = await fetch(`/api/admin/properties/${propertyId}/pricing`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: editingDate }),
      });
      if (r.ok) {
        const d = editingDate;
        setPricingMap((prev) => { const m = new Map(prev); m.delete(d); return m; });
        setEditingDate(null);
      }
    } finally {
      setSavingPrice(false);
    }
  }

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

  const dragSelection =
    isDragging && dragStartRef.current && dragCurrent
      ? new Set(getDatesInRange(dragStartRef.current, dragCurrent))
      : new Set<string>();

  return (
    <div className="bg-white border border-warm-border rounded-card p-5">

      {/* ── Header: mode toggle + month nav ── */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex items-center bg-cream border border-warm-border rounded-full p-0.5">
          {(["availability", "pricing"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setEditingDate(null); }}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all capitalize",
                mode === m
                  ? "bg-charcoal text-white shadow-sm"
                  : "text-stone hover:text-charcoal"
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <h2 className="font-serif text-lg font-semibold text-charcoal w-36 text-center">
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

      {/* ── Day headers ── */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-stone-light uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      {/* ── Availability grid ── */}
      {mode === "availability" && (
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} />;
            const key        = toKey(year, month, day);
            const isPast     = key < today;
            const isToday    = key === today;
            const isSaving   = saving === key;
            const dbEntry    = locallyUnblocked.has(key) ? undefined : blockedMap.get(key);
            const isClientManual = clientBlocked.has(key);
            const effectiveReason: Reason | null =
              dbEntry?.reason ?? (isClientManual ? "MANUAL" : null);
            const style      = effectiveReason ? REASON_STYLE[effectiveReason] : null;
            const canToggle  =
              !isPast && !isSaving &&
              (effectiveReason === null || effectiveReason === "MANUAL");
            const tooltipData = dbEntry;
            return (
              <div key={key} className="relative flex justify-center py-0.5">
                <button
                  disabled={!canToggle}
                  onClick={() => canToggle && toggleManual(key)}
                  onMouseEnter={() => tooltipData && setTooltip({ key, info: tooltipData })}
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
      )}

      {/* ── Pricing grid ── */}
      {mode === "pricing" && (
        <div
          className={cn(
            "grid grid-cols-7 gap-y-0.5 select-none",
            pricingLoading && "opacity-60 pointer-events-none"
          )}
        >
          {cells.map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} />;
            const key       = toKey(year, month, day);
            const isPast    = key < today;
            const isToday   = key === today;
            const hasCustom = pricingMap.has(key);
            const price     = pricingMap.get(key) ?? baseRate;
            const isEditing = editingDate === key;
            const isInDrag  = dragSelection.has(key);
            return (
              <div key={key} className="relative flex justify-center py-0.5">
                <button
                  onMouseDown={() => handlePriceMouseDown(key, isPast)}
                  onMouseEnter={() => handlePriceMouseEnter(key)}
                  onClick={() => handlePriceClick(key, isPast)}
                  disabled={isPast}
                  className={cn(
                    "w-full h-11 rounded-lg flex flex-col items-center justify-center transition-colors",
                    isPast && "opacity-30 cursor-default",
                    !isPast && !isEditing && !isInDrag && "cursor-pointer hover:bg-cream",
                    isToday && !isPast && "ring-1 ring-charcoal/20",
                    hasCustom && !isPast && "bg-amber-50",
                    isInDrag && !isPast && "bg-sand-light/60 ring-1 ring-sand",
                    isEditing && "bg-sand/10 ring-1 ring-sand",
                  )}
                  aria-label={key}
                >
                  <span
                    className={cn(
                      "text-[11px] font-medium leading-none",
                      hasCustom && !isPast ? "text-amber-700" : "text-charcoal"
                    )}
                  >
                    {day}
                  </span>
                  {!isPast && (
                    <span
                      className={cn(
                        "text-[9px] leading-none mt-0.5",
                        hasCustom ? "text-amber-600 font-semibold" : "text-stone-light"
                      )}
                    >
                      ${price}
                    </span>
                  )}
                </button>

                {/* Inline price editor */}
                {isEditing && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-20 bg-white border border-warm-border rounded-xl shadow-xl p-3 w-44">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-semibold text-stone uppercase tracking-wider">
                        {new Date(year, month, day).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <button
                        onClick={() => setEditingDate(null)}
                        className="text-stone-light hover:text-stone transition-colors"
                      >
                        <X size={11} />
                      </button>
                    </div>
                    <div className="flex items-center border border-warm-border rounded-lg overflow-hidden mb-2 bg-cream focus-within:ring-1 focus-within:ring-sand">
                      <span className="px-2 text-stone text-xs">$</span>
                      <input
                        autoFocus
                        type="number"
                        min="1"
                        step="1"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") savePrice();
                          if (e.key === "Escape") setEditingDate(null);
                        }}
                        placeholder={String(baseRate)}
                        className="flex-1 py-2 text-sm text-charcoal bg-transparent focus:outline-none min-w-0 pr-2"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={savePrice}
                        disabled={savingPrice || !editPrice.trim()}
                        className="flex-1 py-1.5 bg-sand text-white text-xs font-semibold rounded-lg disabled:opacity-50 hover:bg-sand-dark transition-colors"
                      >
                        {savingPrice ? "…" : "Save"}
                      </button>
                      {hasCustom && (
                        <button
                          onClick={resetPrice}
                          disabled={savingPrice}
                          title="Reset to base rate"
                          className="px-2 py-1.5 text-stone-light hover:text-red-500 rounded-lg transition-colors"
                        >
                          <RotateCcw size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Availability footer ── */}
      {mode === "availability" && (
        <>
          <p className="text-[10px] text-stone-light mt-3 flex items-center gap-1.5">
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

      {/* ── Pricing footer ── */}
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
          <span className="text-xs text-stone-light ml-auto">
            Click to set · Drag to set range
          </span>
        </div>
      )}

      {/* ── Bulk price modal ── */}
      {bulkDates && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setBulkDates(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg font-semibold text-charcoal">
                  Set price for {bulkDates.length} night{bulkDates.length !== 1 ? "s" : ""}
                </h3>
                <p className="text-xs text-stone mt-0.5">
                  {bulkDates[0]} – {bulkDates[bulkDates.length - 1]}
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
                className="flex-1 py-2.5 text-sm text-charcoal bg-transparent focus:outline-none pr-3"
              />
              <span className="px-3 text-stone-light text-xs">per night</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={saveBulkPrice}
                disabled={savingBulk || !bulkPrice.trim()}
                className="flex-1 py-2.5 bg-sand text-white text-sm font-semibold rounded-full disabled:opacity-50 hover:bg-sand-dark transition-colors"
              >
                {savingBulk ? "Saving…" : "Apply to all"}
              </button>
              <button
                onClick={resetBulkPrice}
                disabled={savingBulk}
                title="Reset all to base rate"
                className="px-4 py-2.5 border border-warm-border text-stone text-sm rounded-full hover:bg-cream transition-colors"
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
