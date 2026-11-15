import { beforeEach, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  create: vi.fn(),
  transaction: vi.fn(),
  query: vi.fn(),
  settings: vi.fn(),
  updateSettings: vi.fn(),
  updateProperty: vi.fn(),
  createRule: vi.fn(),
}));
vi.mock("next-auth", () => ({ getServerSession: mocks.session }));
vi.mock("../lib/auth", () => ({ authOptions: {} }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("../lib/prisma", () => ({
  prisma: { $transaction: mocks.transaction },
}));
vi.mock("../lib/bookings", () => ({
  createBookingRequest: mocks.create,
  expireStaleBookings: async () => 0,
  BookingUnavailableError: class extends Error {},
  BookingConflictError: class extends Error {},
  BookingAmountMismatchError: class extends Error {},
}));
vi.mock("../lib/rate-limit", () => ({
  bookingLimiter: { check: () => ({ success: true }) },
}));
import { POST as adminPost } from "../app/api/admin/stay-rules/route";
import { POST as bookPost } from "../app/api/payments/create-intent/route";
import { StayValidationError } from "../lib/stay-rules";
const request = (path: string, data: unknown) =>
  new NextRequest(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
beforeEach(() => {
  vi.resetAllMocks();
  mocks.query.mockResolvedValue([{ id: "default" }]);
  mocks.settings.mockResolvedValue({ version: 2 });
  mocks.transaction.mockImplementation((fn) =>
    fn({
      $queryRaw: mocks.query,
      staySettings: {
        findUniqueOrThrow: mocks.settings,
        update: mocks.updateSettings,
      },
      property: { update: mocks.updateProperty },
      stayRule: { create: mocks.createRule },
    }),
  );
});
test("unauthenticated visitors cannot change the minimum", async () => {
  mocks.session.mockResolvedValue(null);
  expect(
    (
      await adminPost(
        request("/api/admin/stay-rules", {
          action: "default",
          version: 2,
          minimumNights: 1,
        }),
      )
    ).status,
  ).toBe(401);
  expect(mocks.transaction).not.toHaveBeenCalled();
});
test("stale admin form cannot overwrite a newer rule", async () => {
  mocks.session.mockResolvedValue({ user: { id: "owner" } });
  const res = await adminPost(
    request("/api/admin/stay-rules", {
      action: "default",
      version: 1,
      minimumNights: 7,
    }),
  );
  expect(res.status).toBe(409);
  expect(mocks.updateSettings).not.toHaveBeenCalled();
});
test("owner can save a seven-night season with normalized inclusive dates", async () => {
  mocks.session.mockResolvedValue({ user: { id: "owner" } });
  const res = await adminPost(
    request("/api/admin/stay-rules", {
      action: "saveRule",
      version: 2,
      name: "Christmas",
      propertyId: null,
      startDate: "2099-12-20",
      endDate: "2099-12-31",
      minimumNights: 7,
    }),
  );
  expect(res.status).toBe(200);
  expect(mocks.createRule).toHaveBeenCalledWith({
    data: expect.objectContaining({
      startDate: new Date("2099-12-20T00:00:00Z"),
      endDate: new Date("2099-12-31T00:00:00Z"),
      minimumNights: 7,
    }),
  });
});
test("booking API returns actionable minimum error from authoritative server validator", async () => {
  mocks.create.mockRejectedValue(
    new StayValidationError(
      "This arrival requires at least 7 nights.",
      "MINIMUM_STAY",
      7,
      "2099-01-08",
    ),
  );
  const res = await bookPost(
    request("/api/payments/create-intent", {
      propertyId: "home",
      guestName: "Guest",
      guestEmail: "guest@example.com",
      guestPhone: "1234567890",
      checkIn: "2099-01-01",
      checkOut: "2099-01-02",
      totalAmount: 100,
      minimumNights: 1,
    }),
  );
  expect(res.status).toBe(400);
  expect(await res.json()).toMatchObject({
    code: "MINIMUM_STAY",
    minimumNights: 7,
    earliestCheckout: "2099-01-08",
  });
});
test("impossible API dates are rejected before booking service", async () => {
  const res = await bookPost(
    request("/api/payments/create-intent", {
      propertyId: "home",
      guestName: "Guest",
      guestEmail: "guest@example.com",
      guestPhone: "1234567890",
      checkIn: "2099-02-30",
      checkOut: "2099-03-03",
      totalAmount: 100,
    }),
  );
  expect(res.status).toBe(400);
  expect(mocks.create).not.toHaveBeenCalled();
});
