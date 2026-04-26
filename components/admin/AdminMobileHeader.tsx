"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, X, LayoutDashboard, Building2, Star, LogOut, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin",            label: "Bookings",   icon: LayoutDashboard },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/reviews",    label: "Reviews",    icon: Star },
];

export default function AdminMobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-charcoal border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(160deg, #0F2945 0%, #1B3A6B 50%, #C8834A 100%)",
            }}
          >
            <span className="font-serif text-white/60 text-[10px] font-semibold">RV</span>
          </div>
          <span className="text-white text-sm font-semibold">Rammies Vacation</span>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-white/60 hover:text-white transition-colors p-1"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden bg-charcoal border-b border-white/8 px-3 pb-3">
          <nav className="space-y-0.5">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    active
                      ? "bg-sand/15 text-sand"
                      : "text-stone-light/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-light/50 hover:text-white hover:bg-white/5 transition-all"
            >
              <ExternalLink size={15} />
              View site
            </a>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-light/50 hover:text-white hover:bg-white/5 transition-all"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
