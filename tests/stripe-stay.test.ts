import { beforeEach, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import { StayValidationError } from "../lib/stay-rules";

const mocks = vi.hoisted(() => ({
  event: vi.fn(),
  create: vi.fn(),
  existing: vi.fn(),
  review: vi.fn(),
  upsert: vi.fn(),
  Unavailable: class extends Error {},
  AmountMismatch: class extends Error {},
}));
vi.mock("stripe", () => ({
  default: class {
    webhooks = { constructEvent: mocks.event };
  },
}));
vi.mock("../lib/env", () => ({
  env: { STRIPE_SECRET_KEY: "test", STRIPE_WEBHOOK_SECRET: "test" },
}));
vi.mock("../lib/bookings", () => ({
  createBookingFromPayment: mocks.create,
  BookingUnavailableError: mocks.Unavailable,
  BookingAmountMismatchError: mocks.AmountMismatch,
}));
vi.mock("../lib/prisma", () => ({
  prisma: {
    booking: { findUnique: mocks.existing },
    paymentReview: { findUnique: mocks.review, upsert: mocks.upsert },
  },
}));
import { POST } from "../app/api/webhooks/stripe/route";

const intent = {
  id: "pi_test",
  amount: 20000,
  currency: "usd",
  metadata: {
    propertyId: "home",
    guestName: "Guest",
    guestEmail: "guest@example.com",
    guestPhone: "123456789",
    checkIn: "2099-01-01",
    checkOut: "2099-01-02",
  },
};
const request = () =>
  new NextRequest("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body: "{}",
    headers: { "stripe-signature": "test" },
  });
beforeEach(() => {
  vi.resetAllMocks();
  mocks.event.mockReturnValue({
    type: "payment_intent.succeeded",
    data: { object: intent },
  });
  mocks.existing.mockResolvedValue(null);
  mocks.review.mockResolvedValue(null);
});

test("too-short successful payment is recorded for reconciliation, without booking", async () => {
  mocks.create.mockRejectedValue(
    new StayValidationError("At least 2 nights", "MINIMUM_STAY", 2),
  );
  const res = await POST(request());
  expect(res.status).toBe(200);
  expect(await res.json()).toMatchObject({ needsReview: true });
  expect(mocks.upsert).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { paymentIntentId: "pi_test" },
      create: expect.objectContaining({ amount: 200, currency: "usd" }),
    }),
  );
});
test("Stripe retry of flagged payment is acknowledged without recreating booking", async () => {
  mocks.review.mockResolvedValue({ id: "review" });
  expect((await POST(request())).status).toBe(200);
  expect(mocks.create).not.toHaveBeenCalled();
});
test("malformed paid dates are flagged rather than endlessly retried", async () => {
  mocks.event.mockReturnValue({
    type: "payment_intent.succeeded",
    data: {
      object: {
        ...intent,
        metadata: { ...intent.metadata, checkIn: "2099-02-30" },
      },
    },
  });
  const res = await POST(request());
  expect(res.status).toBe(200);
  expect(mocks.upsert).toHaveBeenCalled();
  expect(mocks.create).not.toHaveBeenCalled();
});
test("legacy ISO-midnight metadata keeps its calendar date", async () => {
  mocks.event.mockReturnValue({
    type: "payment_intent.succeeded",
    data: {
      object: {
        ...intent,
        metadata: {
          ...intent.metadata,
          checkIn: "2099-01-01T00:00:00.000Z",
          checkOut: "2099-01-03T00:00:00.000Z",
        },
      },
    },
  });
  mocks.create.mockResolvedValue({ id: "new" });
  expect((await POST(request())).status).toBe(200);
  expect(mocks.create).toHaveBeenCalledWith(
    expect.objectContaining({ checkIn: new Date("2099-01-01T00:00:00Z") }),
  );
});
test.each(["unavailable", "amount"])(
  "permanent %s failure is recorded for review",
  async (reason) => {
    mocks.create.mockRejectedValue(
      reason === "unavailable"
        ? new mocks.Unavailable("Dates are not available")
        : new mocks.AmountMismatch("Amount mismatch"),
    );
    expect((await POST(request())).status).toBe(200);
    expect(mocks.upsert).toHaveBeenCalled();
  },
);
test("manual Payment Link events without legacy metadata are left to the admin workflow", async () => {
  mocks.event.mockReturnValue({
    type: "payment_intent.succeeded",
    data: { object: { ...intent, metadata: {} } },
  });
  expect((await POST(request())).status).toBe(200);
  expect(mocks.create).not.toHaveBeenCalled();
  expect(mocks.upsert).not.toHaveBeenCalled();
});
