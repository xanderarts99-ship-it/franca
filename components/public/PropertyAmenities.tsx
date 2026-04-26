"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Wifi, Tv, UtensilsCrossed, WashingMachine, Wind, AirVent,
  Thermometer, Waves, Car, PawPrint, Flame, Monitor, Coffee,
  Sparkles, Baby, Camera, Bell, Square, CheckCircle2, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Icon mapping ──────────────────────────────────────────────────────────────

function getAmenityIcon(amenity: string): LucideIcon {
  const a = amenity.toLowerCase();
  if (a.includes("wifi") || a.includes("wi-fi")) return Wifi;
  if (a.includes(" tv") || a === "tv" || a.startsWith("tv ")) return Tv;
  if (a.includes("kitchen") || a.includes("cooking") || a.includes("stove") || a.includes("oven") || a.includes("dishwasher") || a.includes("refrigerator") || a.includes("microwave") || a.includes("freezer") || a.includes("dining")) return UtensilsCrossed;
  if (a.includes("washer")) return WashingMachine;
  if (a.includes("dryer") || a.includes("drying")) return Wind;
  if (a.includes("air conditioning") || a.includes("air condition")) return AirVent;
  if (a.includes("heating") || a.includes("heat") || a.includes("thermometer")) return Thermometer;
  if (a.includes("pool") || a.includes("waves")) return Waves;
  if (a.includes("parking") || a.includes("garage")) return Car;
  if (a.includes("pets allowed") || a.includes("pet")) return PawPrint;
  if (a.includes("bbq") || a.includes("grill") || a.includes("fire pit") || a.includes("fire extinguisher") || a.includes("barbecue")) return Flame;
  if (a.includes("workspace") || a.includes("monitor") || a.includes("dedicated workspace")) return Monitor;
  if (a.includes("coffee") || a.includes("espresso") || a.includes("kettle")) return Coffee;
  if (a.includes("dishwasher") || a.includes("sparkle")) return Sparkles;
  if (a.includes("crib")) return Baby;
  if (a.includes("security camera") || a.includes("exterior security")) return Camera;
  if (a.includes("smoke alarm") || a.includes("carbon monoxide") || a.includes("alarm")) return Bell;
  if (a.includes("iron")) return Square;
  return CheckCircle2;
}

// ── Category mapping ──────────────────────────────────────────────────────────

const CATEGORIES = [
  "Bathroom",
  "Bedroom & Laundry",
  "Kitchen",
  "Entertainment",
  "Family",
  "Heating & Cooling",
  "Outdoor",
  "Parking",
  "Safety",
  "Internet & Office",
  "Services",
  "General",
] as const;

type Category = typeof CATEGORIES[number];

function getCategory(amenity: string): Category {
  const a = amenity.toLowerCase();

  if (
    a.includes("bath") || a.includes("shower") || a.includes("shampoo") ||
    a.includes("conditioner") || a.includes("soap") || a.includes("hair dryer") ||
    a.includes("bathtub") || a.includes("hot water") || a.includes("towel") ||
    a.includes("toilet") || a.includes("shower gel") || a.includes("body soap")
  ) return "Bathroom";

  if (
    a.includes("washer") || a.includes("dryer") || a.includes("iron") ||
    a.includes("bed linen") || a.includes("pillow") || a.includes("blanket") ||
    a.includes("hanger") || a.includes("clothing") || a.includes("shade") ||
    a.includes("drying rack") || a.includes("safe") || a.includes("bed sheet") ||
    a.includes("essentials")
  ) return "Bedroom & Laundry";

  if (
    a.includes("kitchen") || a.includes("refrigerator") || a.includes("microwave") ||
    a.includes("stove") || a.includes("oven") || a.includes("dishwasher") ||
    a.includes("coffee") || a.includes("toaster") || a.includes("blender") ||
    a.includes("freezer") || a.includes("dining") || a.includes("wine") ||
    a.includes("cooking") || a.includes("kettle") || a.includes("baking") ||
    a.includes("trash") || a.includes("barbecue") || a.includes("rice maker") ||
    a.includes("bread maker") || a.includes("espresso") || a.includes("dishes") ||
    a.includes("silverware") || a.includes("fridge") || a.includes("mini fridge") ||
    a.includes("compactor")
  ) return "Kitchen";

  if (
    a.includes("tv") || a.includes("ethernet") || a.includes("sound") ||
    a.includes("books") || a.includes("board games")
  ) return "Entertainment";

  if (
    a.includes("crib") || a.includes("children") || a.includes("outlet covers") ||
    a.includes("toys")
  ) return "Family";

  if (
    a.includes("air conditioning") || a.includes("heating") || a.includes("heat") ||
    a.includes("ceiling fan") || a.includes("central")
  ) return "Heating & Cooling";

  if (
    a.includes("patio") || a.includes("balcony") || a.includes("backyard") ||
    a.includes("bbq") || a.includes("outdoor") || a.includes("fire pit") ||
    a.includes("garden") || a.includes("pool") || a.includes("hammock") ||
    a.includes("sun lounger") || a.includes("elevator") || a.includes("grill")
  ) return "Outdoor";

  if (a.includes("parking") || a.includes("garage")) return "Parking";

  if (
    a.includes("smoke") || a.includes("carbon monoxide") ||
    a.includes("fire extinguisher") || a.includes("first aid") ||
    a.includes("security camera") || a.includes("exterior security")
  ) return "Safety";

  if (
    a.includes("wifi") || a.includes("wi-fi") || a.includes("workspace") ||
    a.includes("dedicated") || a.includes("monitor") || a.includes("ethernet")
  ) return "Internet & Office";

  if (
    a.includes("self check-in") || a.includes("keypad") || a.includes("smart lock") ||
    a.includes("long term") || a.includes("pets allowed") || a.includes("laundromat") ||
    a.includes("private entrance")
  ) return "Services";

  return "General";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AmenityRow({ amenity }: { amenity: string }) {
  const Icon = getAmenityIcon(amenity);
  return (
    <div className="flex items-center gap-2.5 text-sm text-stone py-1">
      <Icon size={15} className="text-stone-light shrink-0" />
      <span className="leading-snug">{amenity}</span>
    </div>
  );
}

function AmenitiesModal({ amenities }: { amenities: string[] }) {
  const grouped = amenities.reduce<Record<Category, string[]>>(
    (acc, amenity) => {
      const cat = getCategory(amenity);
      (acc[cat] ??= []).push(amenity);
      return acc;
    },
    {} as Record<Category, string[]>
  );

  const orderedCategories = CATEGORIES.filter((cat) => (grouped[cat]?.length ?? 0) > 0);

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "w-[calc(100vw-2rem)] max-w-2xl max-h-[85vh]",
          "bg-surface border border-warm-border rounded-2xl shadow-2xl",
          "flex flex-col",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-warm-border shrink-0">
          <Dialog.Title className="font-serif text-xl font-semibold text-charcoal">
            All amenities
          </Dialog.Title>
          <Dialog.Close className="rounded-full w-8 h-8 flex items-center justify-center text-stone-light hover:text-charcoal hover:bg-cream transition-colors cursor-pointer">
            <X size={16} />
          </Dialog.Close>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <div className="space-y-6">
            {orderedCategories.map((cat) => (
              <div key={cat}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-light mb-3 pb-2 border-b border-warm-border">
                  {cat}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  {grouped[cat].map((amenity) => (
                    <AmenityRow key={amenity} amenity={amenity} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-warm-border shrink-0">
          <Dialog.Close className="w-full py-2.5 rounded-full border border-warm-border bg-cream hover:bg-warm-border/50 text-sm font-semibold text-charcoal transition-colors cursor-pointer">
            Close
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface Props {
  amenities: string[];
}

export default function PropertyAmenities({ amenities }: Props) {
  const [open, setOpen] = useState(false);
  const preview = amenities.slice(0, 12);
  const hasMore = amenities.length > 12;

  return (
    <section className="py-8 border-b border-warm-border">
      <h2 className="font-serif text-2xl font-semibold text-charcoal mb-5">
        What this place offers
      </h2>

      {/* First 12 amenities grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 mb-5">
        {preview.map((amenity) => (
          <AmenityRow key={amenity} amenity={amenity} />
        ))}
      </div>

      {/* Show all button */}
      {hasMore && (
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-warm-border bg-surface hover:bg-cream text-sm font-semibold text-charcoal transition-colors cursor-pointer">
              Show all {amenities.length} amenities
            </button>
          </Dialog.Trigger>
          <AmenitiesModal amenities={amenities} />
        </Dialog.Root>
      )}
    </section>
  );
}
