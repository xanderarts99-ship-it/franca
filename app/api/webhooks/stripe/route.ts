import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { env } from "@/lib/env";
import { createBookingFromPayment } from "@/lib/bookings";

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

  try {
    const intent = event.data.object as Stripe.PaymentIntent;
    const meta = intent.metadata;

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
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    await createBookingFromPayment({
      stripePaymentIntentId: intent.id,
      propertyId: meta.propertyId,
      guestName: meta.guestName,
      guestEmail: meta.guestEmail,
      guestPhone: meta.guestPhone,
      checkIn: new Date(meta.checkIn),
      checkOut: new Date(meta.checkOut),
      totalAmount: intent.amount / 100,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[WEBHOOK] Processing failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
