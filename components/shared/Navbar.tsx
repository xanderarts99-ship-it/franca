"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-sm border-b border-warm-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="shrink-0" aria-label="Rammies Vacation Rentals — Home">
            <Image
              src="/logo-transparent.png"
              alt="Rammies Vacation Rentals"
              width={48}
              height={48}
              className="h-11 w-11 md:h-13 md:w-13 object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            <Link
              href="/#properties"
              className={cn(
                "text-sm font-medium tracking-wide transition-colors duration-300 hover:text-sand",
                scrolled ? "text-stone" : "text-white/85"
              )}
            >
              Properties
            </Link>
            <Link
              href="/#contact"
              className={cn(
                "text-sm font-medium tracking-wide transition-colors duration-300 hover:text-sand",
                scrolled ? "text-stone" : "text-white/85"
              )}
            >
              Contact
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className={cn(
              "md:hidden p-2 rounded-lg transition-colors duration-200",
              scrolled
                ? "text-charcoal hover:bg-cream-dark"
                : "text-white hover:bg-white/10"
            )}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 bg-white border-b border-warm-border",
          menuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="px-4 py-4 flex flex-col gap-1">
          <Link
            href="/#properties"
            onClick={() => setMenuOpen(false)}
            className="text-sm font-medium text-stone hover:text-sand py-2.5 border-b border-warm-border transition-colors"
          >
            Properties
          </Link>
          <Link
            href="/#contact"
            onClick={() => setMenuOpen(false)}
            className="text-sm font-medium text-stone hover:text-sand py-2.5 transition-colors"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
