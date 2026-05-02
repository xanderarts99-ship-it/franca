"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "all" | "pending" | "confirmed" | "closed";

interface TabConfig {
  key: Tab;
  label: string;
  count?: number;
}

interface BookingsTabBarProps {
  tabs: TabConfig[];
  activeTab: Tab;
}

export default function BookingsTabBar({ tabs, activeTab }: BookingsTabBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleTabClick(key: Tab) {
    if (key === activeTab) return;
    startTransition(() => router.push(`/admin?tab=${key}`));
  }

  return (
    <div className="flex items-center gap-1 mb-4 bg-white border border-warm-border rounded-xl p-1 w-fit">
      {tabs.map(({ key, label, count }) => (
        <button
          key={key}
          type="button"
          onClick={() => handleTabClick(key)}
          disabled={isPending}
          className={cn(
            "relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:cursor-wait",
            activeTab === key
              ? "bg-sand text-white shadow-sm"
              : "text-stone hover:text-charcoal hover:bg-[#FAFAF7]"
          )}
        >
          {isPending && activeTab !== key ? null : null}
          {label}
          {count !== undefined && count > 0 && (
            <span
              className={cn(
                "inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold",
                activeTab === key
                  ? "bg-white/20 text-white"
                  : key === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-warm-border text-stone"
              )}
            >
              {count}
            </span>
          )}
        </button>
      ))}
      {isPending && (
        <span className="ml-1 flex items-center text-stone">
          <Loader2 size={13} className="animate-spin" />
        </span>
      )}
    </div>
  );
}
