// TODO: Replace with real Stripe PaymentIntent when keys are available
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isDateRangeAvailable } from "@/lib/availability";
import { createBookingFromPayment } from "@/lib/bookings";

function parseDateLocal(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const bodySchema = z.object({
  propertyId: z.string().min(1),
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(7),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "checkIn must be YYYY-MM-DD"),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "checkOut must be YYYY-MM-DD"),
  totalAmount: z.number().positive(),
});

export async function POST(request: NextRequest) {
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
  const totalNights = Math.round(
    (checkOutDate.getTime() - checkInDate.getTime()) / 86400000
  );

  if (totalNights <= 0) {
    return NextResponse.json(
      { error: "checkOut must be after checkIn" },
      { status: 400 }
    );
  }

  // Verify availability
  const available = await isDateRangeAvailable(propertyId, checkInDate, checkOutDate);
  if (!available) {
    return NextResponse.json(
      { error: "Selected dates are no longer available" },
      { status: 409 }
    );
  }

  // Server-side amount verification
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { nightlyRate: true },
  });
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const expectedAmount = Number(property.nightlyRate) * totalNights;
  if (Math.abs(expectedAmount - totalAmount) > 1) {
    return NextResponse.json(
      { error: "Amount mismatch — please refresh and try again" },
      { status: 400 }
    );
  }

  try {
    const booking = await createBookingFromPayment({
      stripePaymentIntentId: `pi_mock_${Date.now()}`,
      propertyId,
      guestName,
      guestEmail,
      guestPhone,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalAmount: expectedAmount,
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      mock: true,
    });
  } catch (err) {
    console.error("create-intent error:", err);
    return NextResponse.json(
      { error: "Booking failed. Please try again." },
      { status: 500 }
    );
  }
}
