import { prisma } from "./prisma";
import { generateBookingReference } from "./booking-ref";
import { isDateRangeAvailable } from "./availability";
import { calculateBookingTotal, validateBookingAmount } from "./pricing";
import {
  sendBookingConfirmationEmail,
  sendGuestBookingRequest,
  sendAdminNewBookingRequest,
  sendGuestBookingRejected,
} from "./email";
import type { Booking, Property } from "@prisma/client";

// ── Custom error types ──────────────────────────────────────────────

export class BookingUnavailableError extends Error {
  constructor() {
    super("Dates are not available");
    this.name = "BookingUnavailableError";
  }
}

export class BookingConflictError extends Error {
  constructor() {
    super("Dates held by another pending booking");
    this.name = "BookingConflictError";
  }
}

export class BookingAmountMismatchError extends Error {
  constructor() {
    super("Amount mismatch");
    this.name = "BookingAmountMismatchError";
  }
}

// ── Helpers ────────────────────────────────────────────────────────

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

// ── New manual payment-link workflow ───────────────────────────────

interface CreateBookingRequestInput {
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: Date;
  checkOut: Date;
  totalAmount: number;
  nightlyTotal?: number;
  cleaningFee?: number;
  taxRate?: number;
  taxAmount?: number;
}

export async function createBookingRequest(
  data: CreateBookingRequestInput
): Promise<Booking> {
  const {
    propertyId,
    guestName,
    guestEmail,
    guestPhone,
    checkIn,
    checkOut,
    totalAmount,
  } = data;

  const checkInNorm = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
  const checkOutNorm = new Date(
    checkOut.getFullYear(),
    checkOut.getMonth(),
    checkOut.getDate()
  );
  const totalNights = Math.round(
    (checkOutNorm.getTime() - checkInNorm.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (totalNights <= 0) throw new Error("checkOut must be after checkIn");

  // 1. Confirm availability (checks CONFIRMED bookings + blocked dates)
  const available = await isDateRangeAvailable(propertyId, checkInNorm, checkOutNorm);
  if (!available) throw new BookingUnavailableError();

  // 2. Check for an existing PENDING_PAYMENT booking on the same dates
  const conflictCount = await prisma.booking.count({
    where: {
      propertyId,
      status: "PENDING_PAYMENT",
      checkIn: { lt: checkOutNorm },
      checkOut: { gt: checkInNorm },
    },
  });
  if (conflictCount > 0) throw new BookingConflictError();

  // 3. Verify amount using the pricing library
  const isValid = await validateBookingAmount(
    propertyId,
    checkInNorm,
    checkOutNorm,
    totalAmount
  );
  if (!isValid) throw new BookingAmountMismatchError();

  // 4. Get full breakdown to store on booking
  const breakdown = await calculateBookingTotal(propertyId, checkInNorm, checkOutNorm);

  // 5. Create the booking — dates NOT blocked until CONFIRMED
  const bookingReference = await generateBookingReference();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const booking = await prisma.booking.create({
    data: {
      propertyId,
      guestName,
      guestEmail,
      guestPhone,
      checkIn: checkInNorm,
      checkOut: checkOutNorm,
      totalNights,
      nightlyTotal: breakdown.nightlyTotal,
      cleaningFee: breakdown.cleaningFee,
      taxRate: breakdown.taxRate,
      taxAmount: breakdown.taxAmount,
      totalAmount: breakdown.totalAmount,
      status: "PENDING_PAYMENT",
      bookingReference,
      expiresAt,
    },
  });

  // 6. Send emails — failures must not roll back the booking
  const bookingWithProperty = await prisma.booking.findUniqueOrThrow({
    where: { id: booking.id },
    include: {
      property: {
        include: { cancellationPolicy: true },
      },
    },
  });

  try {
    await sendGuestBookingRequest(bookingWithProperty);
  } catch (err) {
    console.error("Failed to send guest booking request email:", err);
  }

  try {
    await sendAdminNewBookingRequest(bookingWithProperty);
  } catch (err) {
    console.error("Failed to send admin booking notification email:", err);
  }

  return booking;
}

export async function confirmBooking(
  bookingId: string,
  adminNotes?: string
): Promise<Booking & { property: Property }> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { property: true },
  });

  if (!booking) throw new Error("Booking not found");

  if (booking.status !== "PENDING_PAYMENT") {
    if (booking.status === "CONFIRMED") throw new Error("Booking is already confirmed");
    if (booking.status === "EXPIRED") throw new Error("This booking request has expired");
    throw new Error("Cannot confirm a cancelled booking");
  }

  // Auto-expire if past the deadline
  if (booking.expiresAt && booking.expiresAt < new Date()) {
    await prisma.booking.update({ where: { id: bookingId }, data: { status: "EXPIRED" } });
    throw new Error("This booking request has expired");
  }

  // Re-validate — another booking may have been confirmed while this was pending
  const available = await isDateRangeAvailable(
    booking.propertyId,
    booking.checkIn,
    booking.checkOut
  );
  if (!available) {
    throw new Error(
      "These dates are no longer available. Another booking was confirmed in the meantime."
    );
  }

  // Transaction: mark CONFIRMED + block dates atomically
  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        ...(adminNotes ? { paymentNotes: adminNotes } : {}),
      },
    });

    const dates = eachDayInRange(booking.checkIn, booking.checkOut);
    await tx.blockedDate.createMany({
      data: dates.map((date) => ({
        propertyId: booking.propertyId,
        date,
        reason: "BOOKING" as const,
        bookingId,
      })),
    });
  });

  const updated = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: {
      property: {
        include: { cancellationPolicy: true },
      },
    },
  });

  try {
    await sendBookingConfirmationEmail(updated);
  } catch (err) {
    console.error("Failed to send booking confirmation email:", err);
  }

  return updated as Booking & { property: Property };
}

export async function rejectBooking(
  bookingId: string,
  reason?: string
): Promise<Booking & { property: Property }> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { status: true },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.status !== "PENDING_PAYMENT") {
    throw new Error("Only pending booking requests can be rejected");
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
      rejectedAt: new Date(),
      ...(reason ? { rejectionReason: reason } : {}),
    },
  });

  const updated = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { property: true },
  });

  try {
    await sendGuestBookingRejected(updated);
  } catch (err) {
    console.error("Failed to send booking rejection email:", err);
  }

  return updated;
}

export async function expireStaleBookings(): Promise<number> {
  const result = await prisma.booking.updateMany({
    where: {
      status: "PENDING_PAYMENT",
      expiresAt: { lt: new Date() },
    },
    data: { status: "EXPIRED" },
  });
  return result.count;
}

// ── Legacy: used by old mock payment flow ──────────────────────────

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

    await tx.blockedDate.deleteMany({ where: { bookingId } });
  });
}
