import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createBookingFromPayment } from "@/lib/bookings";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (webhookSecret && signature) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    // Development mode — no signature verification
    try {
      event = JSON.parse(rawBody) as Stripe.Event;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
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
      console.error("Stripe webhook: missing metadata fields", meta);
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
    console.error("Stripe webhook processing failed:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
