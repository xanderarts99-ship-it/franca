"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  Tag, X, Loader2, AlertCircle, ImagePlus, Trash2,
  FileText, Users, Sparkles, Camera, Save, GripVertical, Plus,
} from "lucide-react";
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
  "w-full px-4 py-3 text-sm rounded-xl border border-warm-border bg-cream text-charcoal placeholder:text-stone-light/50 focus:outline-none focus:ring-2 focus:ring-sand/40 focus:border-transparent transition-all";

const COMMON_AMENITIES = [
  "WiFi", "Pool", "Hot Tub", "Parking", "Kitchen", "Air Conditioning",
  "Washer/Dryer", "BBQ Grill", "Pet-Friendly", "Gym", "Netflix",
  "Coffee Maker", "Workspace", "Fire Pit", "Balcony", "Ocean View",
];

/* ── Field wrapper ──────────────────────────────────────────────────── */
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

/* ── Section header ─────────────────────────────────────────────────── */
function SectionHeader({
  icon, title, subtitle, aside,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-6 pb-5 border-b border-warm-border">
      <div className="w-9 h-9 rounded-lg bg-sand-light flex items-center justify-center text-sand shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="font-serif text-lg font-semibold text-charcoal leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-stone mt-0.5">{subtitle}</p>}
      </div>
      {aside}
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
        opacity: isDragging ? 0.4 : 1,
      }}
      className={cn(
        "relative aspect-square rounded-xl overflow-hidden group border border-warm-border cursor-grab active:cursor-grabbing",
        isDragging && "z-50 shadow-2xl ring-2 ring-sand/30"
      )}
    >
      {/* Drag target covers image */}
      <div className="w-full h-full" {...attributes} {...listeners}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" />
      </div>

      {/* Cover badge */}
      {idx === 0 && (
        <span className="absolute top-2 left-2 bg-sand text-white text-[9px] font-bold px-2 py-0.5 rounded-full pointer-events-none z-10 uppercase tracking-wide">
          Cover
        </span>
      )}

      {/* Drag grip — visible on hover */}
      <div className="absolute bottom-2 left-2 w-5 h-5 rounded-md bg-black/40 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <GripVertical size={10} className="text-white" />
      </div>

      {isDeleting ? (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <Loader2 size={18} className="animate-spin text-white" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onDelete(url)}
          className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/55 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:scale-110 z-10 cursor-pointer"
          aria-label="Remove image"
        >
          <Trash2 size={11} />
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

  const [images, setImages]               = useState<string[]>(property.images);
  const [uploadingFiles, setUploadingFiles] = useState<{ id: string; preview: string }[]>([]);
  const [deletingUrls, setDeletingUrls]   = useState<Set<string>>(new Set());
  const [dragOver, setDragOver]           = useState(false);

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

  const availableSuggestions = COMMON_AMENITIES.filter((s) => !amenities.includes(s));

  /* ── Upload logic ─────────────────────────────────────────────────── */
  function uploadFiles(files: File[]) {
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

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    uploadFiles(files);
  }

  function onDropFiles(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    uploadFiles(files);
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
  const totalImages  = images.length + uploadingFiles.length;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

      {/* ── Basic Information ──────────────────────────────────── */}
      <div className="bg-white border border-warm-border rounded-card p-6">
        <SectionHeader
          icon={<FileText size={15} />}
          title="Basic Information"
          subtitle="Name, location, and pricing"
        />

        <div className="space-y-4">
          <Field label="Property name" error={errors.name?.message}>
            <input
              type="text"
              placeholder="Oceanfront Villa"
              {...register("name")}
              className={cn(INPUT_BASE, errors.name && "border-red-300 focus:ring-red-300")}
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Location" error={errors.location?.message}>
              <input
                type="text"
                placeholder="Miami Beach, FL"
                {...register("location")}
                className={cn(INPUT_BASE, errors.location && "border-red-300 focus:ring-red-300")}
              />
            </Field>

            <Field label="Nightly rate (USD)" error={errors.nightlyRate?.message}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-light text-sm pointer-events-none">$</span>
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

          <Field label="Description" error={errors.description?.message}>
            <textarea
              rows={6}
              placeholder="Describe the property…"
              {...register("description")}
              className={cn(
                INPUT_BASE,
                "resize-none leading-relaxed",
                errors.description && "border-red-300 focus:ring-red-300"
              )}
            />
          </Field>
        </div>
      </div>

      {/* ── Capacity ───────────────────────────────────────────── */}
      <div className="bg-white border border-warm-border rounded-card p-6">
        <SectionHeader
          icon={<Users size={15} />}
          title="Capacity"
          subtitle="Guests and sleeping arrangements"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Guests" error={errors.guests?.message}>
            <input
              type="number" min={1} max={20} step={1}
              {...register("guests")}
              className={cn(
                INPUT_BASE,
                "text-center font-serif text-xl font-semibold",
                errors.guests && "border-red-300 focus:ring-red-300"
              )}
            />
          </Field>
          <Field label="Bedrooms" error={errors.bedrooms?.message}>
            <input
              type="number" min={0} max={20} step={1}
              {...register("bedrooms")}
              className={cn(
                INPUT_BASE,
                "text-center font-serif text-xl font-semibold",
                errors.bedrooms && "border-red-300 focus:ring-red-300"
              )}
            />
          </Field>
          <Field label="Beds" error={errors.beds?.message}>
            <input
              type="number" min={1} max={30} step={1}
              {...register("beds")}
              className={cn(
                INPUT_BASE,
                "text-center font-serif text-xl font-semibold",
                errors.beds && "border-red-300 focus:ring-red-300"
              )}
            />
          </Field>
          <Field label="Bathrooms" error={errors.bathrooms?.message}>
            <input
              type="number" min={0} max={20} step={1}
              {...register("bathrooms")}
              className={cn(
                INPUT_BASE,
                "text-center font-serif text-xl font-semibold",
                errors.bathrooms && "border-red-300 focus:ring-red-300"
              )}
            />
          </Field>
        </div>
      </div>

      {/* ── Amenities ──────────────────────────────────────────── */}
      <div className="bg-white border border-warm-border rounded-card p-6">
        <SectionHeader
          icon={<Sparkles size={15} />}
          title="Amenities"
          subtitle="Press Enter or comma to add a tag"
        />

        {/* Tag input */}
        <div className={cn(
          "flex flex-wrap gap-2 p-3 rounded-xl border border-warm-border bg-cream min-h-13",
          "focus-within:ring-2 focus-within:ring-sand/40 focus-within:border-transparent transition-all",
        )}>
          {amenities.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-sand/10 border border-sand/20 rounded-full text-xs font-medium text-sand"
            >
              <Tag size={9} className="shrink-0" />
              {tag}
              <button
                type="button"
                onClick={() => setAmenities((p) => p.filter((a) => a !== tag))}
                className="ml-0.5 text-sand/50 hover:text-sand transition-colors cursor-pointer"
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
            className="flex-1 min-w-30 bg-transparent text-sm text-charcoal placeholder:text-stone-light/40 focus:outline-none"
          />
        </div>

        {/* Quick-add suggestions */}
        {availableSuggestions.length > 0 && (
          <div className="mt-3.5">
            <p className="text-[10px] uppercase tracking-wider text-stone-light font-medium mb-2">
              Quick add
            </p>
            <div className="flex flex-wrap gap-1.5">
              {availableSuggestions.slice(0, 12).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    if (!amenities.includes(suggestion)) {
                      setAmenities((p) => [...p, suggestion]);
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-stone border border-warm-border bg-cream hover:border-sand/40 hover:text-sand hover:bg-sand/5 transition-all cursor-pointer"
                >
                  <Plus size={9} />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Photos ─────────────────────────────────────────────── */}
      <div className="bg-white border border-warm-border rounded-card p-6">
        <SectionHeader
          icon={<Camera size={15} />}
          title="Photos"
          subtitle="First image is the cover — drag to reorder"
          aside={
            <span className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full shrink-0",
              atImageLimit
                ? "bg-red-50 text-red-500"
                : "bg-sand-light text-sand"
            )}>
              {totalImages} / 40
            </span>
          }
        />

        {/* Drop zone — always visible unless at limit */}
        {!atImageLimit && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDropFiles}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "mb-5 rounded-xl border-2 border-dashed p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group",
              dragOver
                ? "border-sand bg-sand/5 scale-[1.005]"
                : "border-warm-border bg-cream hover:border-sand/50 hover:bg-sand/5"
            )}
          >
            <div className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center transition-all",
              dragOver
                ? "bg-sand text-white"
                : "bg-sand-light text-sand group-hover:bg-sand group-hover:text-white"
            )}>
              <ImagePlus size={19} />
            </div>
            <div className="text-center">
              <p className={cn(
                "text-sm font-medium transition-colors",
                dragOver ? "text-sand" : "text-stone group-hover:text-charcoal"
              )}>
                {dragOver ? "Drop to upload" : "Drop photos here or click to browse"}
              </p>
              <p className="text-[11px] text-stone-light mt-1">
                JPEG, PNG, or WebP — max 10 MB each
              </p>
            </div>
          </div>
        )}

        {/* Photo grid */}
        {(images.length > 0 || uploadingFiles.length > 0) && (
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

                {/* Uploading slots */}
                {uploadingFiles.map(({ id, preview }) => (
                  <div
                    key={id}
                    className="relative aspect-square rounded-xl overflow-hidden border border-warm-border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="" className="w-full h-full object-cover opacity-30" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/20">
                      <Loader2 size={20} className="animate-spin text-white" />
                      <span className="text-[10px] text-white/70 font-medium">Uploading…</span>
                    </div>
                  </div>
                ))}

                {/* Limit notice */}
                {atImageLimit && (
                  <div className="aspect-square rounded-xl border border-warm-border bg-cream flex items-center justify-center p-3">
                    <p className="text-[10px] text-stone text-center leading-relaxed">
                      Maximum 40 images reached
                    </p>
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Empty state */}
        {images.length === 0 && uploadingFiles.length === 0 && (
          <p className="text-xs text-stone-light text-center py-2">
            No photos yet — upload some above
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {/* ── Sticky save bar ────────────────────────────────────── */}
      <div className="sticky bottom-6 z-10">
        <div className="bg-white border border-warm-border rounded-2xl shadow-lg shadow-black/6 px-5 py-3.5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-charcoal truncate">{property.name}</p>
            <p className="text-[11px] text-stone-light mt-0.5">Unsaved changes will be lost</p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={submitting}
              className="px-4 py-2 rounded-full border border-warm-border text-charcoal text-sm font-medium hover:bg-[#F5F4F1] transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-sand hover:bg-sand-dark text-white font-semibold text-sm transition-all hover:shadow-md hover:shadow-sand/25 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <><Loader2 size={13} className="animate-spin" /> Saving…</>
              ) : (
                <><Save size={13} /> Save changes</>
              )}
            </button>
          </div>
        </div>
      </div>

    </form>
  );
}
