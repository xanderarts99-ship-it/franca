import { Resend } from "resend";
import { render } from "@react-email/components";
import BookingConfirmation from "@/emails/BookingConfirmation";
import GuestBookingRequestEmail from "@/emails/GuestBookingRequestEmail";
import AdminNewBookingRequestEmail from "@/emails/AdminNewBookingRequestEmail";
import GuestBookingRejectedEmail from "@/emails/GuestBookingRejectedEmail";
import ReviewRequestEmail from "@/emails/ReviewRequestEmail";
import type { Booking, Property, CancellationPolicy } from "@prisma/client";

type BookingWithProperty = Booking & {
  property: Property & { cancellationPolicy?: CancellationPolicy | null };
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
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

async function sendEmail(
  resend: Resend,
  from: string,
  emailData: { to: string; subject: string; html: string }
): Promise<void> {
  try {
    const result = await resend.emails.send({ from, ...emailData });
    if (result.error) {
      console.error("[EMAIL ERROR]", {
        type: "resend_api_error",
        error: result.error,
        to: emailData.to,
        subject: emailData.subject,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log("[EMAIL SENT]", {
        id: result.data?.id,
        to: emailData.to,
        subject: emailData.subject,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("[EMAIL EXCEPTION]", {
      error: error instanceof Error ? error.message : error,
      to: emailData.to,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function sendBookingConfirmationEmail(
  booking: BookingWithProperty
): Promise<void> {
  const client = getResend();
  if (!client) return;
  const { resend, from } = client;

  const nightlyTotal = booking.nightlyTotal ? Number(booking.nightlyTotal) : null;
  const cleaningFee = booking.cleaningFee ? Number(booking.cleaningFee) : null;
  const taxRate = booking.taxRate ? Number(booking.taxRate) : null;
  const taxAmount = booking.taxAmount ? Number(booking.taxAmount) : null;

  const html = await render(
    BookingConfirmation({
      bookingReference: booking.bookingReference,
      propertyName: booking.property.name,
      guestName: booking.guestName,
      checkIn: formatDate(booking.checkIn),
      checkOut: formatDate(booking.checkOut),
      checkInTime: booking.property.checkInTime ?? undefined,
      checkOutTime: booking.property.checkOutTime ?? undefined,
      totalNights: booking.totalNights,
      nightlyTotal: nightlyTotal !== null ? formatAmount(nightlyTotal) : null,
      cleaningFee: cleaningFee !== null ? formatAmount(cleaningFee) : null,
      taxRate: taxRate !== null ? taxRate : null,
      taxAmount: taxAmount !== null ? formatAmount(taxAmount) : null,
      totalAmount: formatAmount(Number(booking.totalAmount)),
      cancellationPolicyText: booking.property.cancellationPolicy?.policyText ?? undefined,
      cancellationPolicyName: booking.property.cancellationPolicy?.name ?? undefined,
      checkInInstructions: booking.property.checkInInstructions ?? undefined,
    })
  );

  await sendEmail(resend, from, {
    to: booking.guestEmail,
    subject: `✅ Booking Confirmed — ${booking.property.name} | Ref: ${booking.bookingReference}`,
    html,
  });
}

export async function sendGuestBookingRequest(booking: BookingWithProperty): Promise<void> {
  const client = getResend();
  if (!client) return;
  const { resend, from } = client;

  const nightlyTotal = booking.nightlyTotal ? Number(booking.nightlyTotal) : null;
  const cleaningFee = booking.cleaningFee ? Number(booking.cleaningFee) : null;
  const taxRate = booking.taxRate ? Number(booking.taxRate) : null;
  const taxAmount = booking.taxAmount ? Number(booking.taxAmount) : null;

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
      nightlyTotal: nightlyTotal !== null ? formatAmount(nightlyTotal) : null,
      cleaningFee: cleaningFee !== null ? formatAmount(cleaningFee) : null,
      taxRate: taxRate !== null ? taxRate : null,
      taxAmount: taxAmount !== null ? formatAmount(taxAmount) : null,
    })
  );

  await sendEmail(resend, from, {
    to: booking.guestEmail,
    subject: `📋 Booking Request Received — ${booking.property.name}`,
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

  const nextAuthUrl = process.env.NEXTAUTH_URL ?? "https://www.rammiesvacation.com";
  const bookingUrl = `${nextAuthUrl}/admin/bookings/${booking.id}`;

  const nightlyTotal = booking.nightlyTotal ? Number(booking.nightlyTotal) : null;
  const cleaningFee = booking.cleaningFee ? Number(booking.cleaningFee) : null;
  const taxRate = booking.taxRate ? Number(booking.taxRate) : null;
  const taxAmount = booking.taxAmount ? Number(booking.taxAmount) : null;
  const totalAmountFormatted = formatAmount(Number(booking.totalAmount));

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
      totalAmount: totalAmountFormatted,
      bookingUrl,
      nightlyTotal: nightlyTotal !== null ? formatAmount(nightlyTotal) : null,
      cleaningFee: cleaningFee !== null ? formatAmount(cleaningFee) : null,
      taxRate: taxRate !== null ? taxRate : null,
      taxAmount: taxAmount !== null ? formatAmount(taxAmount) : null,
    })
  );

  await sendEmail(resend, from, {
    to: adminEmail,
    subject: `🔔 New Booking Request — ${booking.property.name} — ${totalAmountFormatted}`,
    html,
  });
}

export async function sendGuestBookingRejected(booking: BookingWithProperty): Promise<void> {
  const client = getResend();
  if (!client) return;
  const { resend, from } = client;

  const siteUrl = process.env.NEXTAUTH_URL ?? "https://www.rammiesvacation.com";

  const html = await render(
    GuestBookingRejectedEmail({
      bookingReference: booking.bookingReference,
      propertyName: booking.property.name,
      guestName: booking.guestName,
      checkIn: formatDate(booking.checkIn),
      checkOut: formatDate(booking.checkOut),
      rejectionReason: booking.rejectionReason ?? undefined,
      siteUrl,
    })
  );

  await sendEmail(resend, from, {
    to: booking.guestEmail,
    subject: `Update on your booking request — ${booking.property.name}`,
    html,
  });
}

export async function sendReviewRequestEmail(
  booking: BookingWithProperty,
  reviewToken: string
): Promise<void> {
  const client = getResend();
  if (!client) return;
  const { resend, from } = client;

  const siteUrl = process.env.NEXTAUTH_URL ?? "https://www.rammiesvacation.com";
  const reviewUrl = `${siteUrl}/reviews/submit?token=${reviewToken}`;

  const html = await render(
    ReviewRequestEmail({
      guestName: booking.guestName,
      propertyName: booking.property.name,
      checkIn: formatDate(booking.checkIn),
      checkOut: formatDate(booking.checkOut),
      reviewUrl,
    })
  );

  await sendEmail(resend, from, {
    to: booking.guestEmail,
    subject: `⭐ How was your stay at ${booking.property.name}?`,
    html,
  });
}
