"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvailabilityCalendarProps {
  blockedDates?: string[]; // "YYYY-MM-DD"
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function toKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayKey() {
  const d = new Date();
  return toKey(d.getFullYear(), d.getMonth(), d.getDate());
}

function MonthGrid({
  year,
  month,
  blockedSet,
  today,
}: {
  year: number;
  month: number;
  blockedSet: Set<string>;
  today: string;
}) {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <p className="text-sm font-semibold text-charcoal mb-3 text-center">
        {MONTHS[month]} {year}
      </p>
      <div className="grid grid-cols-7 gap-y-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-stone-light uppercase pb-1">
            {d}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const key = toKey(year, month, day);
          const isPast = key < today;
          const isBlocked = blockedSet.has(key);
          const isToday = key === today;

          return (
            <div
              key={key}
              className={cn(
                "aspect-square flex items-center justify-center text-xs rounded-full mx-auto w-7 h-7",
                isPast && "text-stone-light/50",
                !isPast && !isBlocked && "text-charcoal",
                isBlocked && !isPast && "bg-red-50 text-red-400 line-through",
                isToday && "ring-1 ring-sand font-semibold",
              )}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AvailabilityCalendar({
  blockedDates = [],
}: AvailabilityCalendarProps) {
  const now = new Date();
  const [offset, setOffset] = useState(0); // months offset from current

  const viewYear = new Date(now.getFullYear(), now.getMonth() + offset, 1).getFullYear();
  const viewMonth = new Date(now.getFullYear(), now.getMonth() + offset, 1).getMonth();

  const nextYear = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1).getFullYear();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1).getMonth();

  const blockedSet = new Set(blockedDates);
  const today = todayKey();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-2xl font-semibold text-charcoal">Availability</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOffset((o) => Math.max(0, o - 2))}
            disabled={offset === 0}
            className="p-1.5 rounded-full hover:bg-cream-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous months"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setOffset((o) => o + 2)}
            className="p-1.5 rounded-full hover:bg-cream-dark transition-colors"
            aria-label="Next months"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Two-month grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <MonthGrid year={viewYear} month={viewMonth} blockedSet={blockedSet} today={today} />
        <MonthGrid year={nextYear} month={nextMonth} blockedSet={blockedSet} today={today} />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-5 text-xs text-stone">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-white border border-warm-border" />
          Available
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-50 border border-red-100" />
          Unavailable
        </div>
      </div>
    </div>
  );
}
