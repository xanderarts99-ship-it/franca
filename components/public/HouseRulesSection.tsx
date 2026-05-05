"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Clock, Home, FileText, LogOut, Users, PawPrint, ScrollText,
  CheckCircle2, XCircle, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getHouseRules } from "@/lib/house-rules";

const ICON_MAP: Record<string, LucideIcon> = {
  Clock, Home, FileText, LogOut,
};

const NEGATIVE_RULES = ["no pets", "no smoking", "no parties", "no events", "no commercial"];

function isNegativeRule(rule: string): boolean {
  const lower = rule.toLowerCase();
  return NEGATIVE_RULES.some((n) => lower.startsWith(n) || lower.includes(n));
}

interface HouseRulesSectionProps {
  guests: number;
  petsAllowed: boolean;
  petFee: number | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  checkInInstructions: string | null;
  checkOutInstructions: string | null;
}

export default function HouseRulesSection({
  guests, petsAllowed, petFee, checkInTime, checkOutTime,
  checkInInstructions, checkOutInstructions,
}: HouseRulesSectionProps) {
  const [open, setOpen] = useState(false);
  const rules = getHouseRules({
    guests, petsAllowed, petFee, checkInTime, checkOutTime,
    checkInInstructions, checkOutInstructions,
  });

  // Fixed 4-rule preview grid
  const previewRules = [
    { icon: Clock, text: `Check-in after ${checkInTime ?? "2:00 PM"}` },
    { icon: Clock, text: `Checkout before ${checkOutTime ?? "12:00 PM"}` },
    { icon: Users, text: `${guests} guests maximum` },
    {
      icon: PawPrint,
      text: petsAllowed ? "Pets allowed" : "No pets allowed",
      negative: !petsAllowed,
    },
  ];

  return (
    <section className="py-8 border-t border-warm-border">
      <div className="flex items-center gap-3 mb-3">
        <span className="shrink-0 w-9 h-9 bg-sand-light rounded-full flex items-center justify-center">
          <ScrollText size={16} className="text-sand" />
        </span>
        <h2 className="font-serif text-2xl font-semibold text-charcoal">
          House Rules
        </h2>
      </div>
      <p className="text-sm text-stone mb-5 leading-relaxed">
        You&apos;ll be staying in someone&apos;s home, so please treat it
        with care and respect.
      </p>

      {/* 2×2 preview grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {previewRules.map(({ icon: Icon, text, negative }) => (
          <div key={text} className="flex items-center gap-2.5 text-sm text-stone">
            {negative ? (
              <XCircle size={15} className="text-red-500 shrink-0" />
            ) : (
              <Icon size={15} className="text-stone-light shrink-0" />
            )}
            <span className={cn("leading-snug", negative && "text-red-600")}>
              {text}
            </span>
          </div>
        ))}
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-warm-border bg-surface hover:bg-cream text-sm font-semibold text-charcoal transition-colors cursor-pointer">
            Show all house rules
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
              "w-[calc(100vw-2rem)] max-w-2xl max-h-[80vh]",
              "bg-surface border border-warm-border rounded-2xl shadow-2xl",
              "flex flex-col",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
              "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
            )}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-warm-border shrink-0">
              <div>
                <Dialog.Title className="font-serif text-xl font-semibold text-charcoal">
                  House Rules
                </Dialog.Title>
                <Dialog.Description className="text-sm text-stone mt-0.5">
                  You&apos;ll be staying in someone&apos;s home, so please treat it
                  with care and respect.
                </Dialog.Description>
              </div>
              <Dialog.Close className="rounded-full w-8 h-8 flex items-center justify-center text-stone-light hover:text-charcoal hover:bg-cream transition-colors cursor-pointer shrink-0 ml-4">
                <X size={16} />
              </Dialog.Close>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5">
              <div className="space-y-6">
                {rules.map((group) => {
                  const CategoryIcon = ICON_MAP[group.icon] ?? ScrollText;
                  return (
                    <div key={group.category}>
                      <div className="flex items-center gap-2 mb-2">
                        <CategoryIcon size={16} className="text-sand shrink-0" />
                        <h3 className="text-base font-semibold text-charcoal">
                          {group.category}
                        </h3>
                      </div>
                      <hr className="border-warm-border mb-3" />
                      <div className="space-y-2.5">
                        {group.rules.map((rule) => {
                          const negative = isNegativeRule(rule);
                          return (
                            <div key={rule} className="flex items-start gap-2.5 text-[15px]">
                              {negative ? (
                                <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                              ) : (
                                <CheckCircle2 size={14} className="text-stone-light shrink-0 mt-0.5" />
                              )}
                              <span className={cn(
                                "leading-snug",
                                negative ? "text-red-600" : "text-stone"
                              )}>
                                {rule}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-warm-border shrink-0">
              <Dialog.Close className="w-full py-2.5 rounded-full border border-warm-border bg-cream hover:bg-warm-border/50 text-sm font-semibold text-charcoal transition-colors cursor-pointer">
                Close
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
