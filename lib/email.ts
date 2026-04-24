import { Resend } from "resend";
import { render } from "@react-email/components";
import BookingConfirmation from "@/emails/BookingConfirmation";
import GuestBookingRequestEmail from "@/emails/GuestBookingRequestEmail";
import AdminNewBookingRequestEmail from "@/emails/AdminNewBookingRequestEmail";
import GuestBookingRejectedEmail from "@/emails/GuestBookingRejectedEmail";
import type { Booking, Property } from "@prisma/client";

type BookingWithProperty = Booking & { property: Property };

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatAmount(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getResend(): { resend: Resend; from: string } | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn("RESEND_API_KEY or RESEND_FROM_EMAIL not set — skipping email");
    return null;
  }
  return { resend: new Resend(apiKey), from };
}

export async function sendBookingConfirmationEmail(
  booking: BookingWithProperty
): Promise<void> {
  const client = getResend();
  if (!client) return;
  const { resend, from } = client;

  const html = await render(
    BookingConfirmation({
      bookingReference: booking.bookingReference,
      propertyName: booking.property.name,
      guestName: booking.guestName,
      checkIn: formatDate(booking.checkIn),
      checkOut: formatDate(booking.checkOut),
      totalNights: booking.totalNights,
      totalAmount: formatAmount(Number(booking.totalAmount)),
    })
  );

  await resend.emails.send({
    from,
    to: booking.guestEmail,
    subject: `Booking Confirmed — ${booking.property.name} | Ref: ${booking.bookingReference}`,
    html,
  });
}

export async function sendGuestBookingRequest(booking: BookingWithProperty): Promise<void> {
  const client = getResend();
  if (!client) return;
  const { resend, from } = client;

  const html = await render(
    GuestBookingRequestEmail({
      bookingReference: booking.bookingReference,
      propertyName: booking.property.name,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      checkIn: formatDate(booking.checkIn),
      checkOut: formatDate(booking.checkOut),
      totalNights: booking.totalNights,
      totalAmount: formatAmount(Number(booking.totalAmount)),
    })
  );

  await resend.emails.send({
    from,
    to: booking.guestEmail,
    subject: `Booking Request Received — ${booking.property.name} | Ref: ${booking.bookingReference}`,
    html,
  });
}

export async function sendAdminNewBookingRequest(
  booking: BookingWithProperty
): Promise<void> {
  const client = getResend();
  if (!client) return;
  const { resend, from } = client;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("ADMIN_EMAIL not set — skipping admin notification email");
    return;
  }

  const nextAuthUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const bookingUrl = `${nextAuthUrl}/admin/bookings/${booking.id}`;

  const html = await render(
    AdminNewBookingRequestEmail({
      bookingReference: booking.bookingReference,
      propertyName: booking.property.name,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      checkIn: formatDate(booking.checkIn),
      checkOut: formatDate(booking.checkOut),
      totalNights: booking.totalNights,
      totalAmount: formatAmount(Number(booking.totalAmount)),
      bookingUrl,
    })
  );

  await resend.emails.send({
    from,
    to: adminEmail,
    subject: `New Booking Request — ${booking.property.name} · ${formatAmount(Number(booking.totalAmount))} | Ref: ${booking.bookingReference}`,
    html,
  });
}

export async function sendGuestBookingRejected(booking: BookingWithProperty): Promise<void> {
  const client = getResend();
  if (!client) return;
  const { resend, from } = client;

  const html = await render(
    GuestBookingRejectedEmail({
      bookingReference: booking.bookingReference,
      propertyName: booking.property.name,
      guestName: booking.guestName,
      checkIn: formatDate(booking.checkIn),
      checkOut: formatDate(booking.checkOut),
      rejectionReason: booking.rejectionReason ?? undefined,
    })
  );

  await resend.emails.send({
    from,
    to: booking.guestEmail,
    subject: `Booking Request Update — ${booking.property.name} | Ref: ${booking.bookingReference}`,
    html,
  });
}
