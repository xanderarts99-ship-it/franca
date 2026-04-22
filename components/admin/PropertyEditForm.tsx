"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Tag, X, Upload, Loader2, AlertCircle, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const schema = z.object({
  name:        z.string().min(2, "Name must be at least 2 characters").max(100),
  location:    z.string().min(2, "Location is required").max(200),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000),
  nightlyRate: z.coerce.number().positive("Rate must be a positive number"),
  guests:      z.coerce.number().min(1, "At least 1 guest").max(20, "Max 20"),
  bedrooms:    z.coerce.number().min(0, "Cannot be negative").max(20, "Max 20"),
  beds:        z.coerce.number().min(1, "At least 1 bed").max(30, "Max 30"),
  bathrooms:   z.coerce.number().min(0, "Cannot be negative").max(20, "Max 20"),
});

type FormData = z.infer<typeof schema>;

interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  nightlyRate: number;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
}

const INPUT_BASE =
  "w-full px-4 py-3 text-sm rounded-xl border border-warm-border bg-[#FAFAF7] text-charcoal placeholder:text-stone-light/50 focus:outline-none focus:ring-2 focus:ring-sand/40 focus:border-transparent transition-all";

/* ── Reusable field wrapper ─────────────────────────────────────────── */
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

/* ── Sortable image cell ─────────────────────────────────────────────── */
function SortableImageItem({
  url, idx, onDelete, isDeleting,
}: {
  url: string;
  idx: number;
  onDelete: (url: string) => void;
  isDeleting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: url });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="relative aspect-square rounded-xl overflow-hidden group border border-warm-border cursor-grab active:cursor-grabbing"
    >
      {/* Drag target covers the image */}
      <div className="w-full h-full" {...attributes} {...listeners}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" />
      </div>

      {idx === 0 && (
        <span className="absolute top-1.5 left-1.5 bg-sand text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full pointer-events-none z-10">
          Cover
        </span>
      )}

      {isDeleting ? (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <Loader2 size={16} className="animate-spin text-white" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onDelete(url)}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-10"
          aria-label="Remove image"
        >
          <Trash2 size={10} />
        </button>
      )}
    </div>
  );
}

/* ── Main form ──────────────────────────────────────────────────────── */
export default function PropertyEditForm({ property }: { property: Property }) {
  const router = useRouter();

  const [amenities, setAmenities] = useState<string[]>(property.amenities);
  const [tagInput, setTagInput]   = useState("");

  // Only real Cloudinary URLs live here — no blob:// URLs ever
  const [images, setImages] = useState<string[]>(property.images);
  // Files currently uploading: show spinner slot with local preview
  const [uploadingFiles, setUploadingFiles] = useState<{ id: string; preview: string }[]>([]);
  // Which real URLs are mid-delete
  const [deletingUrls, setDeletingUrls] = useState<Set<string>>(new Set());

  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:        property.name,
      location:    property.location,
      description: property.description,
      nightlyRate: property.nightlyRate,
      guests:      property.guests,
      bedrooms:    property.bedrooms,
      beds:        property.beds,
      bathrooms:   property.bathrooms,
    },
  });

  /* ── Amenity helpers ──────────────────────────────────────────────── */
  function addTag() {
    const val = tagInput.trim();
    if (val && !amenities.includes(val)) setAmenities((p) => [...p, val]);
    setTagInput("");
  }

  function onTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && tagInput === "" && amenities.length > 0) {
      setAmenities((p) => p.slice(0, -1));
    }
  }

  /* ── Photo upload ─────────────────────────────────────────────────── */
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";

    for (const file of files) {
      if (images.length + uploadingFiles.length >= 40) {
        toast.error("Maximum 40 images reached");
        break;
      }

      const tempId  = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const preview = URL.createObjectURL(file);

      setUploadingFiles((prev) => [...prev, { id: tempId, preview }]);

      const fd = new FormData();
      fd.append("file", file);

      fetch(`/api/admin/properties/${property.id}/images`, { method: "POST", body: fd })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({})) as { error?: string };
            throw new Error(data.error ?? "Upload failed");
          }
          const data = await res.json() as { url: string };
          setImages((prev) => [...prev, data.url]);
          URL.revokeObjectURL(preview);
        })
        .catch((err: Error) => {
          toast.error(err.message || "Failed to upload image. Please try again.");
          URL.revokeObjectURL(preview);
        })
        .finally(() => {
          setUploadingFiles((prev) => prev.filter((f) => f.id !== tempId));
        });
    }
  }

  /* ── Photo delete ─────────────────────────────────────────────────── */
  async function removeImage(url: string) {
    setDeletingUrls((prev) => new Set(prev).add(url));
    try {
      const res = await fetch(`/api/admin/properties/${property.id}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "Delete failed");
      }
      setImages((prev) => prev.filter((u) => u !== url));
    } catch (err) {
      toast.error((err as Error).message || "Failed to delete image. Please try again.");
    } finally {
      setDeletingUrls((prev) => {
        const next = new Set(prev);
        next.delete(url);
        return next;
      });
    }
  }

  /* ── Drag to reorder ─────────────────────────────────────────────── */
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = images.indexOf(active.id as string);
    const newIdx = images.indexOf(over.id as string);
    if (oldIdx === -1 || newIdx === -1) return;

    const original  = [...images];
    const reordered = arrayMove(images, oldIdx, newIdx);
    setImages(reordered);

    try {
      const res = await fetch(`/api/admin/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: reordered }),
      });
      if (!res.ok) throw new Error("Reorder failed");
    } catch {
      setImages(original);
      toast.error("Failed to save image order. Please try again.");
    }
  }

  /* ── Submit ──────────────────────────────────────────────────────── */
  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, amenities, images }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string };
        toast.error(json.error ?? "Failed to save. Please try again.");
        return;
      }

      toast.success("Property updated successfully");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const atImageLimit = images.length + uploadingFiles.length >= 40;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

      {/* ── Core details ──────────────────────────────────────── */}
      <div className="bg-white border border-warm-border rounded-[var(--radius-card)] p-5 space-y-4">
        <h2 className="font-serif text-base font-semibold text-charcoal">Details</h2>

        <Field label="Property name" error={errors.name?.message}>
          <input
            type="text"
            placeholder="Oceanfront Villa"
            {...register("name")}
            className={cn(INPUT_BASE, errors.name && "border-red-300 focus:ring-red-300")}
          />
        </Field>

        <Field label="Location" error={errors.location?.message}>
          <input
            type="text"
            placeholder="Miami Beach, FL"
            {...register("location")}
            className={cn(INPUT_BASE, errors.location && "border-red-300 focus:ring-red-300")}
          />
        </Field>

        <Field label="Description" error={errors.description?.message}>
          <textarea
            rows={5}
            placeholder="Describe the property…"
            {...register("description")}
            className={cn(
              INPUT_BASE,
              "resize-none leading-relaxed",
              errors.description && "border-red-300 focus:ring-red-300"
            )}
          />
        </Field>

        <Field label="Nightly rate (USD)" error={errors.nightlyRate?.message}>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-light text-sm">$</span>
            <input
              type="number"
              min={1}
              step={0.01}
              placeholder="420"
              {...register("nightlyRate")}
              className={cn(INPUT_BASE, "pl-7", errors.nightlyRate && "border-red-300 focus:ring-red-300")}
            />
          </div>
        </Field>
      </div>

      {/* ── Capacity ──────────────────────────────────────────── */}
      <div className="bg-white border border-warm-border rounded-[var(--radius-card)] p-5">
        <h2 className="font-serif text-base font-semibold text-charcoal mb-4">Capacity</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Guests" error={errors.guests?.message}>
            <input
              type="number" min={1} max={20} step={1}
              {...register("guests")}
              className={cn(INPUT_BASE, errors.guests && "border-red-300 focus:ring-red-300")}
            />
          </Field>
          <Field label="Bedrooms" error={errors.bedrooms?.message}>
            <input
              type="number" min={0} max={20} step={1}
              {...register("bedrooms")}
              className={cn(INPUT_BASE, errors.bedrooms && "border-red-300 focus:ring-red-300")}
            />
          </Field>
          <Field label="Beds" error={errors.beds?.message}>
            <input
              type="number" min={1} max={30} step={1}
              {...register("beds")}
              className={cn(INPUT_BASE, errors.beds && "border-red-300 focus:ring-red-300")}
            />
          </Field>
          <Field label="Bathrooms" error={errors.bathrooms?.message}>
            <input
              type="number" min={0} max={20} step={1}
              {...register("bathrooms")}
              className={cn(INPUT_BASE, errors.bathrooms && "border-red-300 focus:ring-red-300")}
            />
          </Field>
        </div>
      </div>

      {/* ── Amenities ─────────────────────────────────────────── */}
      <div className="bg-white border border-warm-border rounded-[var(--radius-card)] p-5">
        <h2 className="font-serif text-base font-semibold text-charcoal mb-1">Amenities</h2>
        <p className="text-xs text-stone mb-3">Press Enter or comma to add a tag.</p>

        <div className={cn(
          "flex flex-wrap gap-2 p-3 rounded-xl border border-warm-border bg-[#FAFAF7] min-h-[52px]",
          "focus-within:ring-2 focus-within:ring-sand/40 focus-within:border-transparent transition-all",
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
                onClick={() => setAmenities((p) => p.filter((a) => a !== tag))}
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

      {/* ── Photos ────────────────────────────────────────────── */}
      <div className="bg-white border border-warm-border rounded-[var(--radius-card)] p-5">
        <h2 className="font-serif text-base font-semibold text-charcoal mb-1">Photos</h2>
        <p className="text-xs text-stone mb-3">
          First image is the cover. Drag to reorder.
        </p>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

              {images.map((url, idx) => (
                <SortableImageItem
                  key={url}
                  url={url}
                  idx={idx}
                  onDelete={removeImage}
                  isDeleting={deletingUrls.has(url)}
                />
              ))}

              {/* In-progress upload slots */}
              {uploadingFiles.map(({ id, preview }) => (
                <div
                  key={id}
                  className="relative aspect-square rounded-xl overflow-hidden border border-warm-border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="" className="w-full h-full object-cover opacity-40" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Loader2 size={20} className="animate-spin text-white" />
                  </div>
                </div>
              ))}

              {/* Upload button */}
              {!atImageLimit && (
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
              )}

              {/* Limit reached notice in grid */}
              {atImageLimit && (
                <div className="aspect-square rounded-xl border border-warm-border bg-[#FAFAF7] flex items-center justify-center p-3">
                  <p className="text-[10px] text-stone text-center leading-relaxed">
                    Maximum 40 images reached
                  </p>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {/* ── Actions ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pb-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-sand hover:bg-sand-dark text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-sand/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <><Loader2 size={13} className="animate-spin" /> Saving…</>
          ) : (
            <><Upload size={13} /> Save changes</>
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
