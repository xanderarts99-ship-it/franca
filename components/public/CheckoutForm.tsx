"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  Send,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  guestName: z.string().min(2, "Full name must be at least 2 characters"),
  guestEmail: z.string().email("Please enter a valid email address"),
  guestPhone: z
    .string()
    .min(7, "Please enter a valid phone number")
    .regex(/^[+\d\s\-()]+$/, "Please enter a valid phone number"),
});

type FormData = z.infer<typeof schema>;

interface CheckoutFormProps {
  propertyId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  nightlyRate: number;
  total: number;
}

function InputField({
  label,
  icon: Icon,
  error,
  ...props
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-stone">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-light pointer-events-none"
        />
        <input
          {...props}
          className={cn(
            "w-full pl-9 pr-4 py-3 text-sm rounded-xl border bg-cream focus:outline-none focus:ring-2 focus:ring-sand focus:border-transparent transition-all placeholder:text-stone-light/60",
            error
              ? "border-red-300 bg-red-50/30 focus:ring-red-300"
              : "border-warm-border text-charcoal",
          )}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1.5">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

export default function CheckoutForm({
  propertyId,
  checkIn,
  checkOut,
  total,
}: CheckoutFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    setServerError("");

    try {
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          checkIn,
          checkOut,
          totalAmount: total,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone,
        }),
      });

      const json = await res.json();

      if (res.status === 409) {
        const msg: string = json.error ?? "";
        if (msg.toLowerCase().includes("holding")) {
          setServerError(
            "Someone else is currently holding these dates. Please try again in a few minutes or go back and select different dates.",
          );
        } else {
          setServerError(
            "Sorry, these dates are no longer available. Please go back and select different dates.",
          );
        }
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        setServerError(json.error ?? "Booking failed. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push(`/booking-confirmation?bookingId=${json.bookingId}`);
    } catch {
      setServerError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* ── Guest details ─────────────────────────────────── */}
      <section className="bg-surface border border-warm-border rounded-card p-6 mb-4">
        <h2 className="font-serif text-xl font-semibold text-charcoal mb-5">
          Your details
        </h2>
        <div className="flex flex-col gap-4">
          <InputField
            label="Full name"
            icon={User}
            type="text"
            placeholder="Jane Smith"
            autoComplete="name"
            error={errors.guestName?.message}
            {...register("guestName")}
          />
          <InputField
            label="Email address"
            icon={Mail}
            type="email"
            placeholder="jane@example.com"
            autoComplete="email"
            error={errors.guestEmail?.message}
            {...register("guestEmail")}
          />
          <InputField
            label="Phone number"
            icon={Phone}
            type="tel"
            placeholder="+1 (555) 000-0000"
            autoComplete="tel"
            error={errors.guestPhone?.message}
            {...register("guestPhone")}
          />
        </div>
      </section>

      {/* ── How payment works ────────────────────────────── */}
      <section className="bg-surface border border-warm-border rounded-card p-6 mb-4">
        <h2 className="font-serif text-xl font-semibold text-charcoal mb-4">
          How payment works
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-sand text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <p className="text-sm text-stone leading-relaxed">
              Submit your booking request below
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-sand text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <p className="text-sm text-stone leading-relaxed">
              We will send you a{" "}
              <strong className="text-charcoal">Stripe Payment Link</strong> to
              your email within a few hours
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-sand text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <p className="text-sm text-stone leading-relaxed">
              Complete payment via the secure link to confirm your booking
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
          <Clock size={12} className="shrink-0" />
          <span>
            Your booking request expires in 24 hours if payment is not completed
          </span>
        </div>
      </section>

      {/* ── Server error ──────────────────────────────────── */}
      {serverError && (
        <div className="flex items-start gap-2.5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* ── Submit ────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 rounded-full bg-sand hover:bg-sand-dark text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-sand/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            <Send size={14} />
            Submit Booking Request
          </>
        )}
      </button>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-5 mt-5 text-xs text-stone">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-sand" />
          Secure booking
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={12} className="text-sand" />
          No hidden fees
        </div>
      </div>
    </form>
  );
}
