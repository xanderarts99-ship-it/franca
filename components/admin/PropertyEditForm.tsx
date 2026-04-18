"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  Tag, X, Upload, Loader2, AlertCircle, CheckCircle2, ImagePlus, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  name:        z.string().min(2, "Name must be at least 2 characters"),
  location:    z.string().min(2, "Location is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  nightlyRate: z.coerce.number().positive("Rate must be a positive number"),
});

type FormData = z.infer<typeof schema>;

interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  nightlyRate: number;
  amenities: string[];
  images: string[];
}

/* ── Reusable field wrapper ──────────────────────────────────────── */
function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-stone">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1.5">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  );
}

const INPUT_BASE =
  "w-full px-4 py-3 text-sm rounded-xl border border-warm-border bg-[#FAFAF7] text-charcoal placeholder:text-stone-light/50 focus:outline-none focus:ring-2 focus:ring-sand/40 focus:border-transparent transition-all";

export default function PropertyEditForm({ property }: { property: Property }) {
  const router = useRouter();
  const [amenities, setAmenities]     = useState<string[]>(property.amenities);
  const [tagInput, setTagInput]       = useState("");
  const [images, setImages]           = useState<string[]>(property.images);
  const [submitting, setSubmitting]   = useState(false);
  const [saved, setSaved]             = useState(false);
  const [serverError, setServerError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:        property.name,
      location:    property.location,
      description: property.description,
      nightlyRate: property.nightlyRate,
    },
  });

  /* ── Amenity tag helpers ─────────────────────────────────────── */
  function addTag() {
    const val = tagInput.trim();
    if (val && !amenities.includes(val)) {
      setAmenities((prev) => [...prev, val]);
    }
    setTagInput("");
  }

  function onTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && tagInput === "" && amenities.length > 0) {
      setAmenities((prev) => prev.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    setAmenities((prev) => prev.filter((a) => a !== tag));
  }

  /* ── Photo helpers (Cloudinary wired later) ──────────────────── */
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...previews]);
    e.target.value = "";
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  /* ── Submit ──────────────────────────────────────────────────── */
  async function onSubmit(data: FormData) {
    setSubmitting(true);
    setServerError("");
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, amenities, images }),
      });

      if (!res.ok) {
        const json = await res.json();
        setServerError(json.error ?? "Failed to save. Please try again.");
        setSubmitting(false);
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

      {/* ── Core details ─────────────────────────────────────── */}
      <div className="bg-white border border-warm-border rounded-[var(--radius-card)] p-5 space-y-4">
        <h2 className="font-serif text-base font-semibold text-charcoal">Details</h2>

        <Field label="Property name" error={errors.name?.message}>
          <input type="text" placeholder="Oceanfront Villa" {...register("name")}
            className={cn(INPUT_BASE, errors.name && "border-red-300 focus:ring-red-300")} />
        </Field>

        <Field label="Location" error={errors.location?.message}>
          <input type="text" placeholder="Miami Beach, FL" {...register("location")}
            className={cn(INPUT_BASE, errors.location && "border-red-300 focus:ring-red-300")} />
        </Field>

        <Field label="Description" error={errors.description?.message}>
          <textarea
            rows={5}
            placeholder="Describe the property…"
            {...register("description")}
            className={cn(INPUT_BASE, "resize-none leading-relaxed", errors.description && "border-red-300 focus:ring-red-300")}
          />
        </Field>

        <Field label="Nightly rate (USD)" error={errors.nightlyRate?.message}>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-light text-sm">$</span>
            <input type="number" min={1} step={1} placeholder="420" {...register("nightlyRate")}
              className={cn(INPUT_BASE, "pl-7", errors.nightlyRate && "border-red-300 focus:ring-red-300")} />
          </div>
        </Field>
      </div>

      {/* ── Amenities ────────────────────────────────────────── */}
      <div className="bg-white border border-warm-border rounded-[var(--radius-card)] p-5">
        <h2 className="font-serif text-base font-semibold text-charcoal mb-1">Amenities</h2>
        <p className="text-xs text-stone mb-3">Press Enter or comma to add a tag.</p>

        <div className={cn(
          "flex flex-wrap gap-2 p-3 rounded-xl border border-warm-border bg-[#FAFAF7] min-h-[52px] focus-within:ring-2 focus-within:ring-sand/40 focus-within:border-transparent transition-all",
        )}>
          {amenities.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-sand/10 border border-sand/20 rounded-full text-xs font-medium text-sand"
            >
              <Tag size={9} />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 text-sand/60 hover:text-sand transition-colors"
                aria-label={`Remove ${tag}`}
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={onTagKeyDown}
            onBlur={addTag}
            placeholder={amenities.length === 0 ? "WiFi, Pool, Hot Tub…" : ""}
            className="flex-1 min-w-[120px] bg-transparent text-sm text-charcoal placeholder:text-stone-light/40 focus:outline-none"
          />
        </div>
      </div>

      {/* ── Photos ───────────────────────────────────────────── */}
      <div className="bg-white border border-warm-border rounded-[var(--radius-card)] p-5">
        <h2 className="font-serif text-base font-semibold text-charcoal mb-1">Photos</h2>
        <p className="text-xs text-stone mb-3">
          First image becomes the cover. Drag to reorder once Cloudinary is wired up.
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {/* Existing images */}
          {images.map((src, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-warm-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
              {idx === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-sand text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                aria-label="Remove image"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}

          {/* Upload slot */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-warm-border hover:border-sand/50 bg-[#FAFAF7] hover:bg-sand/5 flex flex-col items-center justify-center gap-1.5 transition-all group"
          >
            <ImagePlus size={18} className="text-stone-light group-hover:text-sand transition-colors" />
            <span className="text-[10px] text-stone-light group-hover:text-sand transition-colors font-medium">
              Add photo
            </span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {/* ── Server error / success ────────────────────────────── */}
      {serverError && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
          {serverError}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
          <CheckCircle2 size={13} />
          Changes saved successfully.
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pb-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-sand hover:bg-sand-dark text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-sand/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <><Loader2 size={13} className="animate-spin" /> Saving…</>
          ) : (
            <>
              <Upload size={13} />
              Save changes
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={submitting}
          className="px-6 py-3 rounded-full border border-warm-border text-charcoal text-sm font-semibold hover:bg-[#FAFAF7] transition-all disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

    </form>
  );
}
