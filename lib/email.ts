import { Resend } from "resend";
import { render } from "@react-email/components";
import BookingConfirmation from "@/emails/BookingConfirmation";
import type { Booking, Property } from "@prisma/client";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export async function sendBookingConfirmationEmail(
  booking: Booking & { property: Property }
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn("RESEND_API_KEY or RESEND_FROM_EMAIL not set — skipping confirmation email");
    return;
  }

  const resend = new Resend(apiKey);

  const totalAmount = `$${Number(booking.totalAmount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const html = await render(
    BookingConfirmation({
      bookingReference: booking.bookingReference,
      propertyName: booking.property.name,
      guestName: booking.guestName,
      checkIn: formatDate(booking.checkIn),
      checkOut: formatDate(booking.checkOut),
      totalNights: booking.totalNights,
      totalAmount,
    })
  );

  await resend.emails.send({
    from,
    to: booking.guestEmail,
    subject: `Booking Confirmed — ${booking.property.name} | Ref: ${booking.bookingReference}`,
    html,
  });
}
