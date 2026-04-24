"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Grid2x2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(160deg, #0F2945 0%, #1B3A6B 50%, #C8834A 100%)",
  "linear-gradient(160deg, #1a3a1a 0%, #2d6b2d 50%, #7ab87a 100%)",
  "linear-gradient(160deg, #2a1a0a 0%, #7a4520 50%, #C8934A 100%)",
  "linear-gradient(160deg, #0a1a2a 0%, #204060 50%, #4a80a0 100%)",
  "linear-gradient(160deg, #2a0a1a 0%, #6b2040 50%, #b85a7a 100%)",
];

interface PhotoGridProps {
  images: string[];
  propertyName: string;
}

export default function PhotoGrid({ images, propertyName }: PhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const hasImages = images.length > 0;
  const totalCount = hasImages ? images.length : 5;
  const showAllButton = totalCount > 5;

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = () =>
    setLightboxIndex((i) => (i === null ? 0 : (i - 1 + totalCount) % totalCount));
  const next = () =>
    setLightboxIndex((i) => (i === null ? 0 : (i + 1) % totalCount));

  const renderCell = (index: number, className: string) => (
    <button
      key={index}
      onClick={() => openLightbox(index)}
      className={cn(
        "relative overflow-hidden group cursor-pointer bg-cream-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-sand",
        className
      )}
    >
      {hasImages ? (
        <Image
          src={images[index]}
          alt={`${propertyName} — photo ${index + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={index === 0}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length] }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-white/30 text-5xl font-semibold">RV</span>
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
    </button>
  );

  return (
    <>
      {/* ── Desktop grid (hidden on mobile) ─────────────────── */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-115 rounded-card overflow-hidden">
        {/* Large hero — spans 2 cols × 2 rows */}
        {renderCell(0, "col-span-2 row-span-2")}
        {/* Top right */}
        {renderCell(1, "col-span-1 row-span-1")}
        {/* Top far-right */}
        {renderCell(2, "col-span-1 row-span-1")}
        {/* Bottom right */}
        {renderCell(3, "col-span-1 row-span-1")}
        {/* Bottom far-right with "show all" overlay */}
        <div className="relative col-span-1 row-span-1">
          {renderCell(4, "absolute inset-0")}
          {showAllButton && (
            <button
              onClick={() => openLightbox(4)}
              className="absolute inset-0 bg-black/50 hover:bg-black/60 transition-colors duration-200 flex items-center justify-center gap-2 text-white text-sm font-semibold"
            >
              <Grid2x2 size={16} />
              Show all photos
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile single image ──────────────────────────────── */}
      <div className="md:hidden relative aspect-[4/3] rounded-card overflow-hidden bg-cream-dark">
        {hasImages ? (
          <Image
            src={images[0]}
            alt={propertyName}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: PLACEHOLDER_GRADIENTS[0] }}
          >
            <div className="absolute inset-0 bg-black/20" />
          </div>
        )}
        {showAllButton && (
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5"
          >
            <Grid2x2 size={12} />
            {hasImages ? images.length : 5} photos
          </button>
        )}
      </div>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={28} />
          </button>
          <div
            className="relative w-full max-w-4xl mx-16 aspect-[4/3]"
            onClick={(e) => e.stopPropagation()}
          >
            {hasImages ? (
              <Image
                src={images[lightboxIndex]}
                alt={`${propertyName} — photo ${lightboxIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            ) : (
              <div
                className="absolute inset-0 rounded-lg"
                style={{ background: PLACEHOLDER_GRADIENTS[lightboxIndex % PLACEHOLDER_GRADIENTS.length] }}
              />
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={28} />
          </button>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {lightboxIndex + 1} / {hasImages ? images.length : 5}
          </p>
        </div>
      )}
    </>
  );
}
