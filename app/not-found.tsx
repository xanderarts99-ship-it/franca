import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 text-center">

      {/* Brand mark */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-8"
        style={{
          background: "linear-gradient(160deg, #0F2945 0%, #1B3A6B 50%, #C8834A 100%)",
        }}
      >
        <span className="font-serif text-white/60 text-2xl font-semibold">RV</span>
      </div>

      {/* 404 */}
      <p className="font-serif text-[120px] leading-none font-semibold text-sand/20 select-none mb-2">
        404
      </p>

      {/* Heading */}
      <h1 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal mb-3 -mt-4">
        Page not found
      </h1>
      <p className="text-stone text-sm leading-relaxed max-w-sm mb-10">
        The page you&apos;re looking for has moved, doesn&apos;t exist, or you may
        have followed an old link.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded-full bg-sand hover:bg-sand-dark text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-sand/20 active:scale-[0.98]"
        >
          Back to home
        </Link>
        <Link
          href="/#properties"
          className="px-6 py-3 rounded-full border border-warm-border bg-surface hover:bg-cream text-charcoal font-semibold text-sm transition-all duration-200"
        >
          Browse properties
        </Link>
      </div>

    </div>
  );
}
