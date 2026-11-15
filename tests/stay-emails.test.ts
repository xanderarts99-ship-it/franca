import { afterEach, expect, test, vi } from "vitest";
import { Prisma } from "@prisma/client";
const send = vi.hoisted(() =>
  vi.fn<(message: { html: string }) => Promise<{ data: { id: string } }>>(),
);
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));
import {
  sendBookingConfirmationEmail,
  sendGuestBookingRequest,
} from "../lib/email";
afterEach(() => {
  vi.unstubAllEnvs();
  send.mockClear();
});
test.each([1, 2, 7])(
  "email templates retain saved %i-night duration and calendar dates",
  async (totalNights) => {
    vi.stubEnv("RESEND_API_KEY", "test_only");
    vi.stubEnv("RESEND_FROM_EMAIL", "test@example.com");
    send.mockResolvedValue({ data: { id: "test" } });
    const money = (value: number) => new Prisma.Decimal(value);
    const timestamp = new Date("2027-01-01T00:00:00Z");
    const booking: Parameters<typeof sendBookingConfirmationEmail>[0] = {
      id: "test",
      bookingReference: "TEST",
      guestName: "Guest",
      guestEmail: "guest@example.com",
      guestPhone: "123456789",
      checkIn: new Date("2027-03-13T00:00:00Z"),
      checkOut: new Date(`2027-03-${13 + totalNights}T00:00:00Z`),
      totalNights,
      nightlyTotal: money(200),
      cleaningFee: money(40),
      petFee: null,
      petCount: null,
      taxRate: money(0.06),
      taxAmount: money(14.4),
      totalAmount: money(254.4),
      createdAt: timestamp,
      updatedAt: timestamp,
      status: "CONFIRMED",
      propertyId: "home",
      minimumStayApplied: null,
      stripePaymentIntentId: null,
      expiresAt: null,
      rejectedAt: null,
      rejectionReason: null,
      paymentNotes: null,
      reviewToken: null,
      reviewTokenExpiresAt: null,
      reviewSubmittedAt: null,
      reviewRequestSentAt: null,
      property: {
        id: "home",
        name: "Willow House",
        description: "Test home",
        location: "Katy, TX",
        nightlyRate: money(100),
        guests: 6,
        bedrooms: 3,
        beds: 4,
        bathrooms: 2,
        amenities: [],
        coverImageUrl: "",
        images: [],
        cleaningFee: money(40),
        checkInTime: null,
        checkOutTime: null,
        checkInInstructions: null,
        checkOutInstructions: null,
        taxRate: money(0.06),
        petsAllowed: true,
        petFeeAmount: null,
        cancellationPolicyId: null,
        minimumStayNights: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    };
    await sendBookingConfirmationEmail(booking);
    await sendGuestBookingRequest(booking);
    expect(send).toHaveBeenCalledTimes(2);
    for (const [message] of send.mock.calls) {
      expect(message.html).toContain(
        `${totalNights} night${totalNights === 1 ? "" : "s"}`,
      );
      expect(message.html).toContain("March 13, 2027");
    }
  },
);
