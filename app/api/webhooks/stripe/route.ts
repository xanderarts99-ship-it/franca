import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { env } from "@/lib/env";
import { createBookingFromPayment, BookingUnavailableError, BookingAmountMismatchError } from "@/lib/bookings";
import { prisma } from "@/lib/prisma";
import { parseStayDate } from "@/lib/stay-dates";
import { StayValidationError } from "@/lib/stay-rules";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("[WEBHOOK] Missing stripe-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[WEBHOOK] Invalid signature:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "payment_intent.succeeded") {
    return NextResponse.json({ received: true, ignored: true });
  }

  const intent = event.data.object as Stripe.PaymentIntent;
  try {
    const existing = await prisma.booking.findUnique({ where: { stripePaymentIntentId: intent.id } });
    if (existing) return NextResponse.json({ received: true });
    const review = await prisma.paymentReview.findUnique({ where: { paymentIntentId: intent.id } });
    if (review) return NextResponse.json({ received: true, needsReview: true });
    const meta = intent.metadata;
    // Manual Payment Links are confirmed by the owner; unrelated Stripe payments
    // do not carry this old integration's stay metadata and must not create bookings.
    if (!meta.propertyId && !meta.checkIn && !meta.checkOut) return NextResponse.json({ received: true, ignored: true });

    if (
      !meta.propertyId ||
      !meta.guestName ||
      !meta.guestEmail ||
      !meta.guestPhone ||
      !meta.checkIn ||
      !meta.checkOut
    ) {
      console.error("[WEBHOOK] Missing metadata fields", {
        propertyId: meta?.propertyId ?? "missing",
        hasGuestName: !!meta?.guestName,
        hasGuestEmail: !!meta?.guestEmail,
        hasGuestPhone: !!meta?.guestPhone,
        hasCheckIn: !!meta?.checkIn,
        hasCheckOut: !!meta?.checkOut,
      });
      throw new StayValidationError("Payment details are incomplete. Check the payment and contact the guest.");
    }

    // Old integrations may have used ISO midnight; accept that exact representation only.
    const paymentDate = (value: string) => {
      try { return parseStayDate(value.replace(/T00:00:00(?:\.000)?Z$/, "")); }
      catch { throw new StayValidationError("Payment contains invalid stay dates. Check the payment and contact the guest."); }
    };

    await createBookingFromPayment({
      stripePaymentIntentId: intent.id,
      propertyId: meta.propertyId,
      guestName: meta.guestName,
      guestEmail: meta.guestEmail,
      guestPhone: meta.guestPhone,
      checkIn: paymentDate(meta.checkIn),
      checkOut: paymentDate(meta.checkOut),
      totalAmount: intent.amount / 100,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    if (err instanceof StayValidationError || err instanceof BookingUnavailableError || err instanceof BookingAmountMismatchError || (err instanceof Error && err.message === "Property not found")) {
      // Another copy of this event may have completed while validation was running.
      const accepted = await prisma.booking.findUnique({ where: { stripePaymentIntentId: intent.id } });
      if (accepted) return NextResponse.json({ received: true });
      // A paid event cannot be rejected silently. Persist once, acknowledge retries,
      // and let Franca reconcile/refund in Stripe without creating an invalid booking.
      await prisma.paymentReview.upsert({
        where: { paymentIntentId: intent.id },
        create: { paymentIntentId: intent.id, amount: intent.amount / 100, currency: intent.currency, reason: err.message },
        update: {},
      });
      return NextResponse.json({ received: true, needsReview: true });
    }
    console.error("[WEBHOOK] Processing failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
