import { beforeEach, expect, test, vi } from "vitest";
const db = vi.hoisted(() => ({
  property: { findUnique: vi.fn() },
  propertyPricing: { findMany: vi.fn() },
}));
vi.mock("../lib/prisma", () => ({ prisma: db }));
import { calculateBookingTotal } from "../lib/pricing";
beforeEach(() => vi.resetAllMocks());
test("per-day prices, fees, pets and taxes retain their calculation across DST dates", async () => {
  db.property.findUnique.mockImplementation(async ({ select }) =>
    select.nightlyRate
      ? { nightlyRate: 100 }
      : { cleaningFee: 40, taxRate: 0.06, petsAllowed: true, petFeeAmount: 10 },
  );
  db.propertyPricing.findMany.mockResolvedValue([
    { date: new Date("2027-03-14T00:00:00Z"), price: 150 },
  ]);
  expect(
    await calculateBookingTotal(
      "home",
      new Date("2027-03-13T00:00:00Z"),
      new Date("2027-03-15T00:00:00Z"),
      1,
    ),
  ).toMatchObject({
    nightlyTotal: 250,
    nightlyBreakdown: [
      { date: "2027-03-13", price: 100 },
      { date: "2027-03-14", price: 150 },
    ],
    cleaningFee: 40,
    petFee: 10,
    taxAmount: 18,
    totalAmount: 318,
  });
});
