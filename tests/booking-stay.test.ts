import { beforeEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const db = {
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
    staySettings: { findUniqueOrThrow: vi.fn() },
    stayRule: { findMany: vi.fn() },
    property: { findUniqueOrThrow: vi.fn() },
    booking: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
    blockedDate: { createMany: vi.fn() },
  };
  return {
    db,
    available: vi.fn(),
    amount: vi.fn(),
    breakdown: vi.fn(),
    email: vi.fn(),
  };
});
vi.mock("../lib/prisma", () => ({ prisma: mocks.db }));
vi.mock("../lib/availability", () => ({
  isDateRangeAvailable: mocks.available,
}));
vi.mock("../lib/pricing", () => ({
  validateBookingAmount: mocks.amount,
  calculateBookingTotal: mocks.breakdown,
}));
vi.mock("../lib/booking-ref", () => ({
  generateBookingReference: async () => "TEST",
}));
vi.mock("../lib/email", () => ({
  sendBookingConfirmationEmail: mocks.email,
  sendGuestBookingRequest: mocks.email,
  sendAdminNewBookingRequest: mocks.email,
  sendGuestBookingRejected: mocks.email,
}));

import {
  createBookingRequest,
  createBookingFromPayment,
  confirmBooking,
} from "../lib/bookings";
const input = {
  propertyId: "home",
  guestName: "Guest",
  guestEmail: "test@example.com",
  guestPhone: "1234567890",
  checkIn: new Date("2099-01-01T00:00:00Z"),
  checkOut: new Date("2099-01-03T00:00:00Z"),
  totalAmount: 200,
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.db.$transaction.mockImplementation(async (fn) => fn(mocks.db));
  mocks.db.$queryRaw.mockResolvedValue([{ id: "default" }]);
  mocks.db.staySettings.findUniqueOrThrow.mockResolvedValue({
    minimumNights: 2,
  });
  mocks.db.property.findUniqueOrThrow.mockResolvedValue({
    minimumStayNights: null,
  });
  mocks.db.stayRule.findMany.mockResolvedValue([]);
  mocks.db.booking.count.mockResolvedValue(0);
  mocks.db.booking.findUnique.mockResolvedValue(null);
  mocks.db.booking.create.mockImplementation(async ({ data }) => ({
    id: "b1",
    ...data,
  }));
  mocks.db.booking.findUniqueOrThrow.mockResolvedValue({
    id: "b1",
    property: {},
  });
  mocks.available.mockResolvedValue(true);
  mocks.amount.mockResolvedValue(true);
  mocks.breakdown.mockResolvedValue({
    nightlyTotal: 200,
    cleaningFee: 0,
    petFee: 0,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 200,
  });
});

test("direct call cannot create a one-night booking or send emails", async () => {
  await expect(
    createBookingRequest({
      ...input,
      checkOut: new Date("2099-01-02T00:00:00Z"),
    }),
  ).rejects.toMatchObject({ code: "MINIMUM_STAY", minimumNights: 2 });
  expect(mocks.db.booking.create).not.toHaveBeenCalled();
  expect(mocks.email).not.toHaveBeenCalled();
});
test("request saves server-counted nights and applied minimum with unchanged pricing", async () => {
  const booking = await createBookingRequest(input);
  expect(booking).toMatchObject({
    totalNights: 2,
    minimumStayApplied: 2,
    nightlyTotal: 200,
    totalAmount: 200,
    status: "PENDING_PAYMENT",
  });
  expect(mocks.db.$queryRaw).toHaveBeenCalledOnce();
  expect(mocks.email).toHaveBeenCalledTimes(2);
});
test("seven-night season rejects a six-night direct booking", async () => {
  mocks.db.stayRule.findMany.mockResolvedValue([
    {
      id: "peak",
      name: "Peak",
      propertyId: null,
      startDate: input.checkIn,
      endDate: new Date("2099-01-31T00:00:00Z"),
      minimumNights: 7,
    },
  ]);
  await expect(
    createBookingRequest({
      ...input,
      checkOut: new Date("2099-01-07T00:00:00Z"),
    }),
  ).rejects.toMatchObject({ minimumNights: 7 });
  expect(mocks.db.booking.create).not.toHaveBeenCalled();
});
test("rule changed after initial check is enforced again inside the transaction", async () => {
  mocks.db.staySettings.findUniqueOrThrow
    .mockResolvedValueOnce({ minimumNights: 2 })
    .mockResolvedValueOnce({ minimumNights: 7 });
  await expect(createBookingRequest(input)).rejects.toMatchObject({
    minimumNights: 7,
  });
  expect(mocks.db.booking.create).not.toHaveBeenCalled();
});
test("legacy paid path also rejects a too-short booking without blocking dates", async () => {
  await expect(
    createBookingFromPayment({
      ...input,
      stripePaymentIntentId: "pi_short",
      checkOut: new Date("2099-01-02T00:00:00Z"),
    }),
  ).rejects.toMatchObject({ code: "MINIMUM_STAY" });
  expect(mocks.db.blockedDate.createMany).not.toHaveBeenCalled();
});
test("legacy equal or reversed dates produce a reconcilable validation error", async () => {
  for (const checkOut of [input.checkIn, new Date("2098-12-31T00:00:00Z")]) {
    await expect(
      createBookingFromPayment({
        ...input,
        checkOut,
        stripePaymentIntentId: "pi_bad_dates",
      }),
    ).rejects.toMatchObject({ code: "INVALID_STAY" });
  }
  expect(mocks.db.booking.create).not.toHaveBeenCalled();
});
test("duplicate legacy payment returns original even after rules change", async () => {
  const original = { id: "accepted", totalNights: 1 };
  mocks.db.booking.findUnique.mockResolvedValue(original);
  expect(
    await createBookingFromPayment({
      ...input,
      stripePaymentIntentId: "pi_existing",
    }),
  ).toEqual(original);
  expect(mocks.db.staySettings.findUniqueOrThrow).not.toHaveBeenCalled();
  expect(mocks.email).not.toHaveBeenCalled();
});
test("concurrent duplicate found inside transaction sends no duplicate email", async () => {
  mocks.db.booking.findUnique
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce({ id: "accepted" });
  expect(
    await createBookingFromPayment({
      ...input,
      stripePaymentIntentId: "pi_race",
    }),
  ).toMatchObject({ id: "accepted" });
  expect(mocks.db.booking.create).not.toHaveBeenCalled();
  expect(mocks.email).not.toHaveBeenCalled();
});
test.each([null, 2])(
  "existing pending request with saved minimum %s remains confirmable",
  async (minimumStayApplied) => {
    const booking = {
      id: "old",
      propertyId: "home",
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      status: "PENDING_PAYMENT",
      expiresAt: new Date("2099-01-01T00:00:00Z"),
      minimumStayApplied,
    };
    mocks.db.booking.findUnique.mockResolvedValue(booking);
    await confirmBooking("old");
    expect(mocks.db.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "CONFIRMED" } }),
    );
    expect(mocks.db.staySettings.findUniqueOrThrow).not.toHaveBeenCalled();
    expect(mocks.db.blockedDate.createMany).toHaveBeenCalled();
  },
);
