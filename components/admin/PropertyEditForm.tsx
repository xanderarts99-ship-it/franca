"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  Tag, X, Loader2, AlertCircle, ImagePlus, Trash2,
  FileText, Users, Sparkles, Camera, Save, GripVertical, Plus,
  DollarSign, Clock, ShieldAlert, ChevronDown, PawPrint,
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
  cleaningFee: z.union([
    z.literal("").transform(() => null),
    z.coerce.number().min(0, "Cannot be negative").max(1000, "Max $1,000"),
  ]).optional().nullable(),
  guests:      z.coerce.number().min(1, "At least 1 guest").max(20, "Max 20"),
  bedrooms:    z.coerce.number().min(0, "Cannot be negative").max(20, "Max 20"),
  beds:        z.coerce.number().min(1, "At least 1 bed").max(30, "Max 30"),
  bathrooms:   z.coerce.number().min(0, "Cannot be negative").max(20, "Max 20"),
  checkInTime:           z.string().max(20).optional().nullable(),
  checkOutTime:          z.string().max(20).optional().nullable(),
  checkInInstructions:   z.string().max(1000, "Max 1000 characters").optional().nullable(),
  checkOutInstructions:  z.string().max(1000, "Max 1000 characters").optional().nullable(),
});

type FormInput = z.input<typeof schema>;
type FormData = z.output<typeof schema>;

interface Property {
  id: string;
  name: string;
  location: string;
  description: string;
  nightlyRate: number;
  cleaningFee: number | null;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  checkInTime: string | null;
  checkOutTime: string | null;
  checkInInstructions: string | null;
  checkOutInstructions: string | null;
  cancellationPolicyId: string | null;
  petsAllowed: boolean;
  petFee: number | null;
}

interface CancellationPolicy {
  id: string;
  name: string;
  policyText: string;
}

const INPUT_BASE =
  "w-full px-4 py-3 text-sm rounded-xl border border-warm-border bg-cream text-charcoal placeholder:text-stone-light/50 focus:outline-none focus:ring-2 focus:ring-sand/40 focus:border-transparent transition-all";

const AMENITY_CATEGORIES: { label: string; items: string[] }[] = [
  {
    label: "Essentials",
    items: [
      "WiFi", "Air Conditioning", "Heating", "Washer", "Dryer",
      "Kitchen", "Refrigerator", "Microwave", "Dishwasher",
      "Coffee Maker", "Toaster", "Cooking Basics (pots/pans)",
      "Dishes and Silverware", "Iron and Board",
    ],
  },
  {
    label: "Bathroom",
    items: [
      "Hot Water", "Hair Dryer", "Shampoo", "Body Wash",
      "Towels Provided", "Bathtub",
    ],
  },
  {
    label: "Bedroom & Laundry",
    items: [
      "Bed Linens Provided", "Extra Pillows and Blankets",
      "Clothing Storage (wardrobe/dresser)", "Hangers",
      "Blackout Curtains",
    ],
  },
  {
    label: "Outdoor & Parking",
    items: [
      "Free Parking", "Street Parking", "Garage",
      "Private Pool", "Shared Pool", "Hot Tub",
      "BBQ Grill", "Patio or Balcony", "Garden",
      "Outdoor Dining Area", "Fire Pit",
    ],
  },
  {
    label: "Entertainment",
    items: [
      "Smart TV", "Cable TV", "Netflix",
      "Board Games", "Books",
      "Bluetooth Speaker",
    ],
  },
  {
    label: "Safety",
    items: [
      "Smoke Detector", "Carbon Monoxide Detector",
      "Fire Extinguisher", "First Aid Kit",
      "Security Camera (exterior only)",
      "Safe (lockbox for valuables)",
    ],
  },
  {
    label: "Accessibility",
    items: [
      "Step-Free Access", "Elevator",
      "Wide Doorways", "Ground Floor Access",
    ],
  },
  {
    label: "Family Friendly",
    items: [
      "High Chair", "Crib/Pack-n-Play",
      "Baby Monitor", "Children's Books and Toys",
    ],
  },
  {
    label: "Business",
    items: [
      "Dedicated Workspace", "Desk and Chair",
      "Monitor", "Fast WiFi (100+ Mbps)",
      "Printer",
    ],
  },
];

const ALL_AMENITIES = AMENITY_CATEGORIES.flatMap((c) => c.items);

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
export default function PropertyEditForm({
  property,
  cancellationPolicies,
}: {
  property: Property;
  cancellationPolicies: CancellationPolicy[];
}) {
  const router = useRouter();

  const [amenities, setAmenities] = useState<string[]>(property.amenities);
  const [tagInput, setTagInput]   = useState("");

  const [images, setImages]               = useState<string[]>(property.images);
  const [uploadingFiles, setUploadingFiles] = useState<{ id: string; preview: string }[]>([]);
  const [deletingUrls, setDeletingUrls]   = useState<Set<string>>(new Set());
  const [dragOver, setDragOver]           = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [cancellationPolicyId, setCancellationPolicyId] = useState<string>(
    property.cancellationPolicyId ?? ""
  );
  const [petsAllowed, setPetsAllowed] = useState<boolean>(property.petsAllowed);
  const [petFeeValue, setPetFeeValue] = useState<string>(
    property.petFee != null ? String(property.petFee) : ""
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:                 property.name,
      location:             property.location,
      description:          property.description,
      nightlyRate:          property.nightlyRate,
      cleaningFee:          property.cleaningFee ?? "",
      guests:               property.guests,
      bedrooms:             property.bedrooms,
      beds:                 property.beds,
      bathrooms:            property.bathrooms,
      checkInTime:          property.checkInTime ?? "",
      checkOutTime:         property.checkOutTime ?? "",
      checkInInstructions:  property.checkInInstructions ?? "",
      checkOutInstructions: property.checkOutInstructions ?? "",
    },
  });

  const checkInInstructionsVal  = watch("checkInInstructions") ?? "";
  const checkOutInstructionsVal = watch("checkOutInstructions") ?? "";
  const selectedPolicy = cancellationPolicies.find((p) => p.id === cancellationPolicyId);

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

  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(["Essentials"]));

  function toggleCategory(label: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function toggleAmenity(item: string) {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  }

  const knownAmenities = new Set(ALL_AMENITIES);
  const customAmenities = amenities.filter((a) => !knownAmenities.has(a));

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

    const previousImages = [...images];
    const reordered = arrayMove(images, oldIdx, newIdx);
    setImages(reordered);

    try {
      const res = await fetch(`/api/admin/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: reordered }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string; issues?: { field: string; message: string }[] };
        const detail = json.issues?.length
          ? json.issues.map((i) => `${i.field}: ${i.message}`).join(", ")
          : json.error ?? "Failed to save image order";
        setImages(previousImages);
        toast.error(detail);
        return;
      }
      toast.success("Image order saved");
    } catch {
      setImages(previousImages);
      toast.error("Network error. Please try again.");
    }
  }

  /* ── Submit ──────────────────────────────────────────────────────── */
  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      const body = {
        ...data,
        amenities,
        images,
        cleaningFee:          data.cleaningFee ?? null,
        checkInTime:          (data.checkInTime as string || null),
        checkOutTime:         (data.checkOutTime as string || null),
        checkInInstructions:  (data.checkInInstructions as string || null),
        checkOutInstructions: (data.checkOutInstructions as string || null),
        cancellationPolicyId: cancellationPolicyId || null,
        petsAllowed,
        petFee: petFeeValue !== "" ? Number(petFeeValue) : null,
      };
      const res = await fetch(`/api/admin/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string; issues?: { field: string; message: string }[] };
        const detail = json.issues?.length
          ? json.issues.map((i) => `${i.field}: ${i.message}`).join(", ")
          : json.error ?? "Failed to save changes";
        toast.error(detail);
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

      {/* ── Fees ──────────────────────────────────────────────── */}
      <div className="bg-white border border-warm-border rounded-card p-6">
        <SectionHeader
          icon={<DollarSign size={15} />}
          title="Fees"
          subtitle="Additional charges applied to each booking"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Cleaning fee (USD)" error={errors.cleaningFee?.message}>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-light text-sm pointer-events-none">$</span>
              <input
                type="number"
                min={0}
                step={1}
                placeholder="0 (no cleaning fee)"
                {...register("cleaningFee")}
                className={cn(INPUT_BASE, "pl-7", errors.cleaningFee && "border-red-300 focus:ring-red-300")}
              />
            </div>
          </Field>
        </div>
      </div>

      {/* ── Pets Policy ──────────────────────────────────── */}
      <div className="bg-white border border-warm-border rounded-card p-6">
        <SectionHeader
          icon={<PawPrint size={15} />}
          title="Pets Policy"
          subtitle="Whether guests can bring pets to this property and the fee to charge"
        />

        {/* Pets Allowed toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-charcoal">Pets Allowed</p>
            {petsAllowed ? (
              <p className="text-xs text-emerald-600 mt-0.5">
                Guests may bring pets. Set the fee below.
              </p>
            ) : (
              <p className="text-xs text-red-500 mt-0.5">
                Pets are not allowed at this property.
              </p>
            )}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={petsAllowed}
            onClick={() => setPetsAllowed((v) => !v)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
              petsAllowed ? "bg-sand" : "bg-stone-light/40"
            )}
          >
            <span className={cn(
              "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
              petsAllowed ? "translate-x-5" : "translate-x-0"
            )} />
          </button>
        </div>

        {/* Pet Fee input */}
        <div>
          <label className="block text-xs font-semibold text-stone-light uppercase tracking-wide mb-1.5">
            Pet Fee (USD per stay)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone text-sm">$</span>
            <input
              type="number"
              min="0"
              step="1"
              value={petFeeValue}
              onChange={(e) => setPetFeeValue(e.target.value)}
              placeholder="e.g. 100"
              disabled={!petsAllowed}
              className={cn(
                "w-full pl-7 pr-4 py-2.5 border rounded-lg text-sm text-charcoal bg-surface",
                "focus:outline-none focus:ring-2 focus:ring-sand/50 focus:border-sand",
                !petsAllowed && "opacity-40 cursor-not-allowed"
              )}
            />
          </div>
          <p className="text-xs text-stone mt-1">
            Leave empty for no pet fee. Amount shown to guests in the booking widget.
          </p>
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

      {/* ── Check-in & Check-out ───────────────────────────────── */}
      <div className="bg-white border border-warm-border rounded-card p-6">
        <SectionHeader
          icon={<Clock size={15} />}
          title="Check-in & Check-out"
          subtitle="Times and arrival instructions for guests"
        />
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Check-in time" error={errors.checkInTime?.message}>
              <input
                type="text"
                placeholder="e.g. 3:00 PM"
                {...register("checkInTime")}
                className={cn(INPUT_BASE, errors.checkInTime && "border-red-300 focus:ring-red-300")}
              />
            </Field>
            <Field label="Check-out time" error={errors.checkOutTime?.message}>
              <input
                type="text"
                placeholder="e.g. 11:00 AM"
                {...register("checkOutTime")}
                className={cn(INPUT_BASE, errors.checkOutTime && "border-red-300 focus:ring-red-300")}
              />
            </Field>
          </div>

          <Field label="Check-in instructions" error={errors.checkInInstructions?.message}>
            <div className="relative">
              <textarea
                rows={4}
                placeholder="Door code, parking notes, key pickup location…"
                {...register("checkInInstructions")}
                className={cn(
                  INPUT_BASE, "resize-none leading-relaxed pb-7",
                  errors.checkInInstructions && "border-red-300 focus:ring-red-300"
                )}
              />
              <span className={cn(
                "absolute bottom-2.5 right-3 text-[10px]",
                (checkInInstructionsVal?.length ?? 0) > 950 ? "text-amber-500" : "text-stone-light"
              )}>
                {(checkInInstructionsVal?.length ?? 0)}/1000
              </span>
            </div>
          </Field>

          <Field label="Check-out instructions" error={errors.checkOutInstructions?.message}>
            <div className="relative">
              <textarea
                rows={4}
                placeholder="Key return, trash disposal, lock-up procedure…"
                {...register("checkOutInstructions")}
                className={cn(
                  INPUT_BASE, "resize-none leading-relaxed pb-7",
                  errors.checkOutInstructions && "border-red-300 focus:ring-red-300"
                )}
              />
              <span className={cn(
                "absolute bottom-2.5 right-3 text-[10px]",
                (checkOutInstructionsVal?.length ?? 0) > 950 ? "text-amber-500" : "text-stone-light"
              )}>
                {(checkOutInstructionsVal?.length ?? 0)}/1000
              </span>
            </div>
          </Field>
        </div>
      </div>

      {/* ── Cancellation Policy ─────────────────────────────────── */}
      <div className="bg-white border border-warm-border rounded-card p-6">
        <SectionHeader
          icon={<ShieldAlert size={15} />}
          title="Cancellation Policy"
          subtitle="Policy shown to guests at checkout"
        />
        <div className="space-y-3">
          <div className="relative">
            <select
              value={cancellationPolicyId}
              onChange={(e) => setCancellationPolicyId(e.target.value)}
              className={cn(INPUT_BASE, "appearance-none pr-8 cursor-pointer")}
            >
              <option value="">No cancellation policy</option>
              {cancellationPolicies.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-light pointer-events-none"
            />
          </div>
          {selectedPolicy && (
            <div className="bg-cream border border-warm-border rounded-xl px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-light mb-1.5">
                Policy preview
              </p>
              <p className="text-xs text-stone leading-relaxed">{selectedPolicy.policyText}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Amenities ──────────────────────────────────────────── */}
      <div className="bg-white border border-warm-border rounded-card p-6">
        <SectionHeader
          icon={<Sparkles size={15} />}
          title="Amenities"
          subtitle={`${amenities.length} selected · click categories to expand`}
        />

        {/* Selected tags summary */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4 pb-4 border-b border-warm-border">
            {amenities.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sand/10 border border-sand/20 rounded-full text-xs font-medium text-sand"
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
          </div>
        )}

        {/* Grouped categories */}
        <div className="space-y-2 mb-4">
          {AMENITY_CATEGORIES.map(({ label, items }) => {
            const isOpen = openCategories.has(label);
            const selectedCount = items.filter((i) => amenities.includes(i)).length;
            return (
              <div key={label} className="border border-warm-border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleCategory(label)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-cream hover:bg-[#F0EFE9] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-charcoal">{label}</span>
                    {selectedCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-sand/15 text-sand text-[10px] font-bold rounded-full">
                        {selectedCount}
                      </span>
                    )}
                  </div>
                  <Plus
                    size={14}
                    className={cn(
                      "text-stone-light transition-transform shrink-0",
                      isOpen && "rotate-45"
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 bg-white">
                    {items.map((item) => {
                      const checked = amenities.includes(item);
                      return (
                        <label
                          key={item}
                          className="flex items-center gap-2.5 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAmenity(item)}
                            className="w-4 h-4 rounded border-warm-border text-sand focus:ring-sand/40 cursor-pointer accent-sand"
                          />
                          <span className={cn(
                            "text-sm transition-colors",
                            checked ? "text-charcoal font-medium" : "text-stone group-hover:text-charcoal"
                          )}>
                            {item}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Custom amenity input */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-stone-light font-medium mb-2">
            Custom amenity
          </p>
          <div className={cn(
            "flex gap-2 p-2 rounded-xl border border-warm-border bg-cream",
            "focus-within:ring-2 focus-within:ring-sand/40 focus-within:border-transparent transition-all",
          )}>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={onTagKeyDown}
              onBlur={addTag}
              placeholder="Type a custom amenity and press Enter…"
              className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-stone-light/40 focus:outline-none px-2"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-1.5 rounded-lg bg-sand/10 border border-sand/20 text-sand text-xs font-semibold hover:bg-sand/20 transition-all cursor-pointer shrink-0"
            >
              Add
            </button>
          </div>
          {customAmenities.length > 0 && (
            <p className="text-[11px] text-stone-light mt-1.5">
              Custom: {customAmenities.join(", ")}
            </p>
          )}
        </div>
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
              images.length >= 40
                ? "bg-warm-border/60 text-stone"
                : "bg-sand-light text-sand"
            )}>
              {images.length >= 40 ? `${images.length} photos` : `${totalImages} / 40`}
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
        <div className="bg-charcoal rounded-2xl shadow-2xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-1 h-9 rounded-full bg-sand shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white/90 truncate">{property.name}</p>
              <p className="text-[11px] text-white/35 mt-0.5">Review and save your changes</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={submitting}
              className="px-5 py-2.5 rounded-full border border-white/15 text-white/60 text-sm font-medium hover:border-white/30 hover:text-white/85 transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-sand hover:bg-sand-dark text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-sand/40 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
