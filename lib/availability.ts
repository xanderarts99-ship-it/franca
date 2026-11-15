import { prisma } from "./prisma";

function toKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Returns every date in [checkIn, checkOut) as Date objects. */
function eachDayInRange(checkIn: Date, checkOut: Date): Date[] {
  const dates: Date[] = [];
  const cur = new Date(Date.UTC(checkIn.getUTCFullYear(), checkIn.getUTCMonth(), checkIn.getUTCDate()));
  const end = new Date(Date.UTC(checkOut.getUTCFullYear(), checkOut.getUTCMonth(), checkOut.getUTCDate()));
  while (cur < end) {
    dates.push(new Date(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return dates;
}

/**
 * Returns all unavailable date strings (YYYY-MM-DD) for a property in a given month.
 * A date is unavailable if it has a BlockedDate record (MANUAL or BOOKING) or falls
 * within a CONFIRMED booking's date range.
 */
export async function getBlockedDatesForProperty(
  propertyId: string,
  month: number,
  year: number
): Promise<string[]> {
  const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  try {
    const [blockedDateRecords, confirmedBookings] = await Promise.all([
      prisma.blockedDate.findMany({
        where: {
          propertyId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        select: { date: true },
      }),
      prisma.booking.findMany({
        where: {
          propertyId,
          status: "CONFIRMED",
          checkIn: { lt: endOfMonth },
          checkOut: { gt: startOfMonth },
        },
        select: { checkIn: true, checkOut: true },
      }),
    ]);

    const dateSet = new Set<string>();

    for (const bd of blockedDateRecords) {
      dateSet.add(toKey(bd.date));
    }

    for (const booking of confirmedBookings) {
      for (const date of eachDayInRange(booking.checkIn, booking.checkOut)) {
        if (date >= startOfMonth && date <= endOfMonth) {
          dateSet.add(toKey(date));
        }
      }
    }

    return Array.from(dateSet).sort();
  } catch {
    throw new Error("Failed to fetch blocked dates");
  }
}

/**
 * Returns true if every night in [checkIn, checkOut) is available for the property.
 * Always call this server-side before creating a Stripe PaymentIntent.
 */
export async function isDateRangeAvailable(
  propertyId: string,
  checkIn: Date,
  checkOut: Date
): Promise<boolean> {
  const checkInNorm = new Date(Date.UTC(checkIn.getUTCFullYear(), checkIn.getUTCMonth(), checkIn.getUTCDate()));
  const checkOutNorm = new Date(Date.UTC(checkOut.getUTCFullYear(), checkOut.getUTCMonth(), checkOut.getUTCDate()));

  try {
    const [blockedCount, overlappingBookings] = await Promise.all([
      prisma.blockedDate.count({
        where: {
          propertyId,
          date: { gte: checkInNorm, lt: checkOutNorm },
        },
      }),
      prisma.booking.count({
        where: {
          propertyId,
          status: "CONFIRMED",
          checkIn: { lt: checkOutNorm },
          checkOut: { gt: checkInNorm },
        },
      }),
    ]);

    return blockedCount === 0 && overlappingBookings === 0;
  } catch {
    throw new Error("Failed to check availability");
  }
}

/**
 * Creates BlockedDate records for every night in [checkIn, checkOut) linked to a booking.
 * Call this after a booking is confirmed.
 */
export async function blockDatesForBooking(
  propertyId: string,
  checkIn: Date,
  checkOut: Date,
  bookingId: string
): Promise<void> {
  const dates = eachDayInRange(checkIn, checkOut);

  try {
    await prisma.blockedDate.createMany({
      data: dates.map((date) => ({
        propertyId,
        date,
        reason: "BOOKING" as const,
        bookingId,
      })),
    });
  } catch {
    throw new Error("Failed to block dates for booking");
  }
}

/**
 * Deletes all BlockedDate records associated with a booking.
 * Call this when a booking is cancelled.
 */
export async function unblockDatesForBooking(bookingId: string): Promise<void> {
  try {
    await prisma.blockedDate.deleteMany({
      where: { bookingId },
    });
  } catch {
    throw new Error("Failed to unblock dates for booking");
  }
}
