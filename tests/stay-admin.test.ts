import { test, expect } from "vitest";
import { stayEditSchema } from "../lib/stay-admin";

test("admin rejects values which could make every stay impossible", () => {
  for (const minimumNights of [0, -1, 31, 2.5, "7", null])
    expect(
      stayEditSchema.safeParse({ action: "default", version: 1, minimumNights })
        .success,
    ).toBe(false);
  for (const minimumNights of [1, 2, 7, 30])
    expect(
      stayEditSchema.safeParse({ action: "default", version: 1, minimumNights })
        .success,
    ).toBe(true);
});
test("busy periods reject impossible dates and reversed windows", () => {
  const rule = {
    action: "saveRule",
    version: 1,
    name: "Christmas",
    propertyId: null,
    startDate: "2027-12-20",
    endDate: "2027-12-31",
    minimumNights: 7,
  };
  expect(stayEditSchema.safeParse(rule).success).toBe(true);
  expect(
    stayEditSchema.safeParse({ ...rule, startDate: "2027-12-32" }).success,
  ).toBe(false);
  expect(
    stayEditSchema.safeParse({ ...rule, endDate: "2027-12-19" }).success,
  ).toBe(false);
  expect(stayEditSchema.safeParse({ ...rule, name: "   " }).success).toBe(
    false,
  );
});
