import { prisma } from "./prisma";
import { generateBookingReference } from "./booking-ref";
import { sendBookingConfirmationEmail } from "./email";
import type { Booking } from "@prisma/client";

interface CreateBookingInput {
  stripePaymentIntentId: string;
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: Date;
  checkOut: Date;
  totalAmount: number;
}

function eachDayInRange(checkIn: Date, checkOut: Date): Date[] {
  const dates: Date[] = [];
  const cur = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
  const end = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
  while (cur < end) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export async function createBookingFromPayment(data: CreateBookingInput): Promise<Booking> {
  const {
    stripePaymentIntentId,
    propertyId,
    guestName,
    guestEmail,
    guestPhone,
    checkIn,
    checkOut,
    totalAmount,
  } = data;

  const checkInNorm = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
  const checkOutNorm = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
  const totalNights = Math.round(
    (checkOutNorm.getTime() - checkInNorm.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (totalNights <= 0) throw new Error("checkOut must be after checkIn");

  const bookingReference = await generateBookingReference();

  let booking: Booking;
  try {
    booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          stripePaymentIntentId,
          propertyId,
          guestName,
          guestEmail,
          guestPhone,
          checkIn: checkInNorm,
          checkOut: checkOutNorm,
          totalNights,
          totalAmount,
          status: "CONFIRMED",
          bookingReference,
        },
      });

      const dates = eachDayInRange(checkInNorm, checkOutNorm);
      await tx.blockedDate.createMany({
        data: dates.map((date) => ({
          propertyId,
          date,
          reason: "BOOKING" as const,
          bookingId: created.id,
        })),
      });

      return created;
    });
  } catch (err) {
    throw new Error(
      `Failed to create booking: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  // Email failure must not roll back a successful booking
  try {
    const bookingWithProperty = await prisma.booking.findUniqueOrThrow({
      where: { id: booking.id },
      include: { property: true },
    });
    await sendBookingConfirmationEmail(bookingWithProperty);
  } catch (err) {
    console.error("Failed to send booking confirmation email:", err);
  }

  return booking;
}

export async function cancelBooking(bookingId: string): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.booking.findUnique({
        where: { id: bookingId },
        select: { status: true },
      });
      if (!existing) throw new Error("Booking not found");
      if (existing.status === "CANCELLED") throw new Error("Booking is already cancelled");

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
      });

      await tx.blockedDate.deleteMany({
        where: { bookingId },
      });
    });
  } catch (err) {
    throw err;
  }
}
