"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  createContext,
  useContext,
} from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Shared date-selection context ─────────────────────────────────────────────

interface DateSelectionCtx {
  checkIn: string;   // "YYYY-MM-DD" or ""
  checkOut: string;  // "YYYY-MM-DD" or ""
  setDates: (checkIn: string, checkOut: string) => void;
  clearDates: () => void;
}

export const PropertyDateContext = createContext<DateSelectionCtx>({
  checkIn: "",
  checkOut: "",
  setDates: () => {},
  clearDates: () => {},
});

export function PropertyDateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const setDates = useCallback((ci: string, co: string) => {
    setCheckIn(ci);
    setCheckOut(co);
  }, []);

  const clearDates = useCallback(() => {
    setCheckIn("");
    setCheckOut("");
  }, []);

  return (
    <PropertyDateContext.Provider
      value={{ checkIn, checkOut, setDates, clearDates }}
    >
      {children}
    </PropertyDateContext.Provider>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function toKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function todayKey(): string {
  const d = new Date();
  return toKey(d.getFullYear(), d.getMonth(), d.getDate());
}

// Returns the first blocked key strictly after `afterKey`, or null.
function firstBlockedAfter(afterKey: string, blockedSet: Set<string>): string | null {
  const sorted = Array.from(blockedSet).sort();
  for (const k of sorted) {
    if (k > afterKey) return k;
  }
  return null;
}

// ── MonthGrid ─────────────────────────────────────────────────────────────────

interface MonthGridProps {
  year: number;
  month: number;
  blockedSet: Set<string>;
  pricingMap: Map<string, number>;
  baseRate: number;
  today: string;
  checkIn: string;
  checkOut: string;
  hovered: string;
  // checkIn selected but no checkOut yet → upper bound for selectable checkout
  checkoutLimit: string | null;
  onDayClick: (key: string) => void;
  onDayHover: (key: string) => void;
  onMouseLeave: () => void;
}

function MonthGrid({
  year, month, blockedSet, pricingMap, baseRate, today,
  checkIn, checkOut, hovered, checkoutLimit,
  onDayClick, onDayHover, onMouseLeave,
}: MonthGridProps) {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  // The effective range end for hover highlighting
  const rangeEnd = checkOut || (checkIn && hovered > checkIn ? hovered : "");

  return (
    <div onMouseLeave={onMouseLeave}>
      <p className="text-sm font-semibold text-charcoal mb-3 text-center">
        {MONTHS[month]} {year}
      </p>

      <div className="grid grid-cols-7">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-stone-light uppercase pb-2"
          >
            {d}
          </div>
        ))}

        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;

          const key = toKey(year, month, day);
          const isPast = key < today;
          const isBlocked = blockedSet.has(key);
          const isCheckIn = key === checkIn;
          const isCheckOut = key === checkOut;
          const isToday = key === today;
          const dayPrice = pricingMap.get(key) ?? baseRate;
          const isCustomPrice = pricingMap.has(key);

          // Is this day selectable?
          const isDisabled =
            isPast ||
            isBlocked ||
            !!(checkIn && !checkOut && checkoutLimit !== null && key >= checkoutLimit);

          // Is this day inside the highlighted range?
          const isInRange =
            checkIn &&
            rangeEnd &&
            key > checkIn &&
            key < rangeEnd &&
            !isDisabled;

          const isEndpoint = isCheckIn || isCheckOut;

          return (
            <div
              key={key}
              className={cn(
                "relative flex items-center justify-center",
                isInRange && "bg-sand/10",
                isCheckOut && checkIn && "bg-linear-to-r from-sand/10 to-transparent",
                isCheckIn && rangeEnd && rangeEnd > checkIn && "bg-linear-to-l from-sand/10 to-transparent",
              )}
            >
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && onDayClick(key)}
                onMouseEnter={() => !isDisabled && onDayHover(key)}
                className={cn(
                  "relative z-10 w-full flex flex-col items-center justify-center py-1.5 gap-0.5 rounded-lg transition-colors select-none",
                  isDisabled && "opacity-30 cursor-not-allowed",
                  isBlocked && !isPast && "line-through",
                  isEndpoint && "bg-sand text-white font-semibold",
                  isToday && !isEndpoint && "ring-1 ring-sand font-semibold text-charcoal",
                  !isDisabled && !isEndpoint && "text-charcoal hover:bg-sand/15 cursor-pointer",
                )}
              >
                <span className="text-xs leading-none">{day}</span>
                {!isBlocked && !isPast && (
                  <span className={cn(
                    "text-[9px] leading-none font-medium",
                    isEndpoint ? "text-white/80" : isCustomPrice ? "text-amber-600" : "text-stone-light"
                  )}>
                    ${dayPrice >= 1000 ? `${Math.round(dayPrice / 1000)}k` : dayPrice}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PropertyCalendar ──────────────────────────────────────────────────────────

interface PropertyCalendarProps {
  propertyId: string;
}

export default function PropertyCalendar({ propertyId }: PropertyCalendarProps) {
  const { checkIn, checkOut, setDates, clearDates } = useContext(PropertyDateContext);

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Index of the first displayed month (0 = current month)
  const [offset, setOffset] = useState(0);

  const firstMonth = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  }, [offset, now.getFullYear(), now.getMonth()]);

  const secondMonth = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  }, [offset, now.getFullYear(), now.getMonth()]);

  const [blockedSet, setBlockedSet] = useState<Set<string>>(new Set());
  const [pricingMap, setPricingMap] = useState<Map<string, number>>(new Map());
  const [baseRate, setBaseRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState("");

  // Fetch availability + pricing for both visible months whenever they change
  useEffect(() => {
    let cancelled = false;

    async function fetchAvailability(year: number, month: number): Promise<string[]> {
      const res = await fetch(
        `/api/properties/${propertyId}/availability?month=${month + 1}&year=${year}`
      );
      if (!res.ok) return [];
      const data = (await res.json()) as { blockedDates: string[] };
      return data.blockedDates;
    }

    async function fetchPricing(year: number, month: number): Promise<{ date: string; price: number }[]> {
      const res = await fetch(
        `/api/properties/${propertyId}/pricing-calendar?month=${month + 1}&year=${year}`
      );
      if (!res.ok) return [];
      const data = (await res.json()) as { pricing: { date: string; price: number }[]; baseRate: number };
      if (!cancelled) setBaseRate(data.baseRate);
      return data.pricing;
    }

    async function load() {
      setLoading(true);
      try {
        const [d1, d2, p1, p2] = await Promise.all([
          fetchAvailability(firstMonth.year, firstMonth.month),
          fetchAvailability(secondMonth.year, secondMonth.month),
          fetchPricing(firstMonth.year, firstMonth.month),
          fetchPricing(secondMonth.year, secondMonth.month),
        ]);
        if (!cancelled) {
          setBlockedSet(new Set([...d1, ...d2]));
          const map = new Map<string, number>();
          for (const { date, price } of [...p1, ...p2]) map.set(date, price);
          setPricingMap(map);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [propertyId, firstMonth.year, firstMonth.month, secondMonth.year, secondMonth.month]);

  // Upper bound for checkout selection: first blocked date after checkIn
  const checkoutLimit: string | null = useMemo(() => {
    if (!checkIn || checkOut) return null;
    return firstBlockedAfter(checkIn, blockedSet);
  }, [checkIn, checkOut, blockedSet]);

  const today = todayKey();

  function handleDayClick(key: string) {
    if (!checkIn) {
      // First click → set check-in
      setDates(key, "");
      setHovered("");
      return;
    }

    if (checkIn && !checkOut) {
      if (key <= checkIn) {
        // Clicked before or on check-in → restart with new check-in
        setDates(key, "");
        setHovered("");
        return;
      }
      // Clicked after check-in → set check-out
      setDates(checkIn, key);
      setHovered("");
      return;
    }

    // Both set → restart selection
    setDates(key, "");
    setHovered("");
  }

  function handleDayHover(key: string) {
    if (checkIn && !checkOut) setHovered(key);
  }

  function handleMouseLeave() {
    setHovered("");
  }

  const isPrevDisabled =
    firstMonth.year === currentMonthStart.getFullYear() &&
    firstMonth.month === currentMonthStart.getMonth();

  const selectionLabel =
    !checkIn
      ? "Availability"
      : !checkOut
        ? "Select check-out date"
        : "Availability";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-serif text-2xl font-semibold text-charcoal">
            {selectionLabel}
          </h3>
          {checkIn && !checkOut && (
            <p className="text-xs text-stone mt-0.5">
              Check-in: {checkIn.replace(/-/g, "/")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOffset((o) => Math.max(0, o - 2))}
            disabled={isPrevDisabled}
            className="p-1.5 rounded-full hover:bg-cream-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous months"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setOffset((o) => o + 2)}
            className="p-1.5 rounded-full hover:bg-cream-dark transition-colors"
            aria-label="Next months"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendar grid or loader */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-stone">
          <Loader2 size={22} className="animate-spin text-sand mr-2" />
          <span className="text-sm">Loading availability &amp; pricing…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <MonthGrid
            year={firstMonth.year}
            month={firstMonth.month}
            blockedSet={blockedSet}
            pricingMap={pricingMap}
            baseRate={baseRate}
            today={today}
            checkIn={checkIn}
            checkOut={checkOut}
            hovered={hovered}
            checkoutLimit={checkoutLimit}
            onDayClick={handleDayClick}
            onDayHover={handleDayHover}
            onMouseLeave={handleMouseLeave}
          />
          <MonthGrid
            year={secondMonth.year}
            month={secondMonth.month}
            blockedSet={blockedSet}
            pricingMap={pricingMap}
            baseRate={baseRate}
            today={today}
            checkIn={checkIn}
            checkOut={checkOut}
            hovered={hovered}
            checkoutLimit={checkoutLimit}
            onDayClick={handleDayClick}
            onDayHover={handleDayHover}
            onMouseLeave={handleMouseLeave}
          />
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 mt-5 text-xs text-stone">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-white border border-warm-border" />
          Available
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-stone-light/20" />
          Unavailable
        </div>
        {checkIn && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-sand" />
            Selected
          </div>
        )}
        {checkIn && checkOut && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-sand/10 border border-sand/20" />
            Your stay
          </div>
        )}
      </div>

      {/* Clear */}
      {(checkIn || checkOut) && (
        <button
          type="button"
          onClick={clearDates}
          className="mt-3 text-xs text-stone hover:text-sand underline transition-colors"
        >
          Clear dates
        </button>
      )}
    </div>
  );
}
