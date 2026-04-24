"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Building2, LogOut, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin",       label: "Bookings",   icon: LayoutDashboard },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 bg-charcoal min-h-screen shrink-0">

      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(160deg, #0F2945 0%, #1B3A6B 50%, #C8834A 100%)",
            }}
          >
            <span className="font-serif text-white/60 text-[10px] font-semibold">RV</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">Rammies Vacation</p>
            <p className="text-stone-light/50 text-[10px]">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-sand/15 text-sand"
                  : "text-stone-light/70 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={15} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="px-3 pb-5 border-t border-white/8 pt-4 space-y-0.5">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-light/50 hover:text-white hover:bg-white/5 transition-all"
        >
          <ExternalLink size={15} className="shrink-0" />
          View site
        </a>
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-light/50 hover:text-white hover:bg-white/5 transition-all"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut size={15} className="shrink-0" />
          Sign out
        </button>
      </div>

    </aside>
  );
}
