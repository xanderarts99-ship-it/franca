"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Property {
  id: string;
  name: string;
}

interface DefaultValues {
  propertyId: string;
  guestName: string;
  guestLocation: string;
  rating: number;
  comment: string;
  reviewDate: string;
  featured: boolean;
}

interface Props {
  properties: Property[];
  defaultValues?: DefaultValues;
  reviewId?: string;
}

const INPUT_BASE =
  "w-full px-4 py-3 text-sm rounded-xl border border-warm-border bg-cream text-charcoal placeholder:text-stone-light/50 focus:outline-none focus:ring-2 focus:ring-sand/40 focus:border-transparent transition-all";

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-stone">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-stone-light">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1.5 py-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          className="cursor-pointer transition-transform hover:scale-110"
        >
          <Star
            size={28}
            className={cn(
              "transition-colors",
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-stone-light/30"
            )}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-stone font-medium">
          {value} star{value !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}

export default function ReviewForm({ properties, defaultValues, reviewId }: Props) {
  const router = useRouter();
  const isEdit = !!reviewId;

  const [propertyId, setPropertyId] = useState(defaultValues?.propertyId ?? "");
  const [guestName, setGuestName] = useState(defaultValues?.guestName ?? "");
  const [guestLocation, setGuestLocation] = useState(defaultValues?.guestLocation ?? "");
  const [rating, setRating] = useState(defaultValues?.rating ?? 0);
  const [comment, setComment] = useState(defaultValues?.comment ?? "");
  const [reviewDate, setReviewDate] = useState(defaultValues?.reviewDate ?? "");
  const [featured, setFeatured] = useState(defaultValues?.featured ?? false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  function validate() {
    const errs: Record<string, string> = {};
    if (!propertyId) errs.propertyId = "Property is required";
    if (guestName.trim().length < 2) errs.guestName = "Name must be at least 2 characters";
    if (guestName.trim().length > 100) errs.guestName = "Name must be under 100 characters";
    if (guestLocation.length > 100) errs.guestLocation = "Location must be under 100 characters";
    if (rating < 1) errs.rating = "Please select a rating";
    if (comment.trim().length < 10) errs.comment = "Comment must be at least 10 characters";
    if (comment.trim().length > 1000) errs.comment = "Comment must be under 1000 characters";
    if (!reviewDate) errs.reviewDate = "Review date is required";
    if (reviewDate > today) errs.reviewDate = "Review date cannot be in the future";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const url = isEdit ? `/api/admin/reviews/${reviewId}` : "/api/admin/reviews";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          guestName: guestName.trim(),
          guestLocation: guestLocation.trim() || undefined,
          rating,
          comment: comment.trim(),
          reviewDate,
          featured,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to save review");
        return;
      }

      toast.success(isEdit ? "Review updated successfully" : "Review added successfully");
      router.push("/admin/reviews");
      router.refresh();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="bg-white border border-warm-border rounded-card p-6 space-y-4">

        <Field label="Property" error={errors.propertyId}>
          <select
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className={cn(INPUT_BASE, "cursor-pointer", errors.propertyId && "border-red-300 focus:ring-red-300")}
          >
            <option value="">Select a property…</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Guest name" error={errors.guestName}>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Jane Smith"
              className={cn(INPUT_BASE, errors.guestName && "border-red-300 focus:ring-red-300")}
            />
          </Field>
          <Field label="Guest location (optional)" error={errors.guestLocation}>
            <input
              type="text"
              value={guestLocation}
              onChange={(e) => setGuestLocation(e.target.value)}
              placeholder="New York, NY"
              className={cn(INPUT_BASE, errors.guestLocation && "border-red-300 focus:ring-red-300")}
            />
          </Field>
        </div>

        <Field label="Rating" error={errors.rating}>
          <StarPicker value={rating} onChange={setRating} />
        </Field>

        <Field label="Comment" error={errors.comment} hint={`${comment.length}/1000 characters`}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            placeholder="Share the guest's experience…"
            className={cn(
              INPUT_BASE,
              "resize-none leading-relaxed",
              errors.comment && "border-red-300 focus:ring-red-300"
            )}
          />
          <div className="flex justify-between items-center">
            {errors.comment ? (
              <p className="text-xs text-red-500">{errors.comment}</p>
            ) : (
              <span />
            )}
            <span className={cn(
              "text-[11px]",
              comment.length > 950 ? "text-amber-500" : "text-stone-light"
            )}>
              {comment.length}/1000
            </span>
          </div>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Review date" error={errors.reviewDate}>
            <input
              type="date"
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
              max={today}
              className={cn(INPUT_BASE, "cursor-pointer", errors.reviewDate && "border-red-300 focus:ring-red-300")}
            />
          </Field>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-stone">
              Featured on homepage
            </label>
            <div className="flex items-center gap-3 py-3">
              <button
                type="button"
                onClick={() => setFeatured(!featured)}
                role="switch"
                aria-checked={featured}
                className={cn(
                  "relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0",
                  featured ? "bg-sand" : "bg-warm-border"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                    featured ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
              <span className="text-sm text-stone">
                {featured ? "Will appear on homepage" : "Not featured"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-6 z-10">
        <div className="bg-charcoal rounded-2xl shadow-2xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-1 h-9 rounded-full bg-sand shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white/90">
                {isEdit ? "Edit review" : "New review"}
              </p>
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
                <><Save size={13} /> {isEdit ? "Update review" : "Add review"}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
