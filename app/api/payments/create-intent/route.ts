// Payment workflow: Manual Stripe Payment Link
// Guest submits request → Franca sends Payment Link →
// Franca confirms in dashboard after payment received

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createBookingRequest,
  expireStaleBookings,
  BookingUnavailableError,
  BookingConflictError,
  BookingAmountMismatchError,
} from "@/lib/bookings";

function parseDateLocal(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const bodySchema = z.object({
  propertyId: z.string().min(1),
  guestName: z.string().min(2, "Name must be at least 2 characters").max(100),
  guestEmail: z.string().email("Please enter a valid email address"),
  guestPhone: z.string().min(7, "Please enter a valid phone number").max(20),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "checkIn must be YYYY-MM-DD"),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "checkOut must be YYYY-MM-DD"),
  totalAmount: z.number().positive(),
});

export async function POST(request: NextRequest) {
  // Clean up stale pending bookings before processing
  await expireStaleBookings().catch((err) =>
    console.error("expireStaleBookings error:", err)
  );

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { propertyId, guestName, guestEmail, guestPhone, checkIn, checkOut, totalAmount } =
    parsed.data;

  const checkInDate = parseDateLocal(checkIn);
  const checkOutDate = parseDateLocal(checkOut);

  // Date validations
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (checkInDate < today) {
    return NextResponse.json(
      { error: "Check-in date must be today or in the future." },
      { status: 400 }
    );
  }

  const totalNights = Math.round(
    (checkOutDate.getTime() - checkInDate.getTime()) / 86400000
  );
  if (totalNights <= 0) {
    return NextResponse.json(
      { error: "Check-out must be after check-in." },
      { status: 400 }
    );
  }
  if (totalNights > 30) {
    return NextResponse.json(
      { error: "Maximum stay is 30 nights." },
      { status: 400 }
    );
  }

  try {
    const booking = await createBookingRequest({
      propertyId,
      guestName,
      guestEmail,
      guestPhone,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalAmount,
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      status: "PENDING_PAYMENT",
    });
  } catch (err) {
    if (err instanceof BookingUnavailableError) {
      return NextResponse.json(
        {
          error:
            "These dates are no longer available. Please go back and select different dates.",
        },
        { status: 409 }
      );
    }
    if (err instanceof BookingConflictError) {
      return NextResponse.json(
        {
          error:
            "Someone else is currently holding these dates. Please try again in a few minutes or select different dates.",
        },
        { status: 409 }
      );
    }
    if (err instanceof BookingAmountMismatchError) {
      return NextResponse.json(
        { error: "Price mismatch. Please refresh the page and try again." },
        { status: 400 }
      );
    }

    console.error("create-intent error:", err);
    return NextResponse.json(
      { error: "Booking failed. Please try again." },
      { status: 500 }
    );
  }
}
