import { test } from "vitest";
import assert from "node:assert/strict";
import {
  addDays,
  dateKey,
  parseStayDate,
  stayNights,
  todayAtProperty,
} from "../lib/stay-dates";
import {
  resolveMinimumStay,
  validateStay,
  checkoutAllowed,
  type StayPolicy,
} from "../lib/stay-rules";

const policy: StayPolicy = {
  defaultMinimum: 2,
  propertyMinimum: null,
  rules: [],
};
test("all homes inherit two nights; one night rejected, two accepted", () => {
  assert.equal(resolveMinimumStay(policy, "2027-01-01").minimumNights, 2);
  assert.throws(
    () => validateStay(policy, "2027-01-01", "2027-01-02", "2026-01-01"),
    /at least 2 nights/,
  );
  assert.equal(
    validateStay(policy, "2027-01-01", "2027-01-03", "2026-01-01").nights,
    2,
  );
});
test("strict real calendar dates, leap years, DST and Chicago today", () => {
  for (const key of [
    "2027-02-29",
    "2027-02-31",
    "2027-13-01",
    "foo",
    "2027-01-01T00:00:00Z",
  ])
    assert.throws(() => parseStayDate(key));
  assert.equal(dateKey(parseStayDate("2028-02-29")), "2028-02-29");
  assert.equal(stayNights("2027-03-13", "2027-03-15"), 2);
  assert.equal(stayNights("2027-11-06", "2027-11-08"), 2);
  assert.equal(addDays("2027-12-31", 2), "2028-01-02");
  assert.equal(todayAtProperty(new Date("2027-01-01T03:00:00Z")), "2026-12-31");
});
test("season boundaries include both arrival dates; stay crossing peak uses arrival", () => {
  const p: StayPolicy = {
    ...policy,
    rules: [
      {
        id: "peak",
        name: "Christmas",
        propertyId: null,
        startDate: "2027-12-20",
        endDate: "2027-12-31",
        minimumNights: 7,
      },
    ],
  };
  for (const key of ["2027-12-20", "2027-12-31"])
    assert.equal(resolveMinimumStay(p, key).minimumNights, 7);
  assert.equal(
    validateStay(p, "2027-12-19", "2027-12-21", "2026-01-01").nights,
    2,
  );
  assert.equal(resolveMinimumStay(p, "2028-01-01").minimumNights, 2);
});
test("specific season beats global season; strictest wins within scope", () => {
  const base = {
    startDate: "2027-07-01",
    endDate: "2027-07-31",
    name: "Summer",
  };
  const p: StayPolicy = {
    defaultMinimum: 2,
    propertyMinimum: 4,
    rules: [
      { ...base, id: "g1", propertyId: null, minimumNights: 7 },
      { ...base, id: "g2", propertyId: null, minimumNights: 10 },
    ],
  };
  assert.equal(resolveMinimumStay(p, "2027-07-02").minimumNights, 10);
  p.rules.push({ ...base, id: "p1", propertyId: "home", minimumNights: 3 });
  assert.equal(resolveMinimumStay(p, "2027-07-02").minimumNights, 3);
  p.rules.push({ ...base, id: "p2", propertyId: "home", minimumNights: 5 });
  assert.equal(resolveMinimumStay(p, "2027-07-02").minimumNights, 5);
  assert.equal(resolveMinimumStay(p, "2027-08-01").minimumNights, 4);
});
test("past, reversed, same day and over maximum are rejected", () => {
  for (const [ci, co] of [
    ["2025-01-01", "2025-01-03"],
    ["2027-01-03", "2027-01-01"],
    ["2027-01-01", "2027-01-01"],
    ["2027-01-01", "2027-02-01"],
  ])
    assert.throws(() => validateStay(policy, ci, co, "2026-01-01"));
});
test("departure on first blocked night allowed; crossing blocked night rejected", () => {
  const blocked = ["2027-01-04"];
  assert.equal(checkoutAllowed("2027-01-01", "2027-01-02", 2, blocked), false);
  assert.equal(checkoutAllowed("2027-01-01", "2027-01-04", 2, blocked), true);
  assert.equal(checkoutAllowed("2027-01-01", "2027-01-05", 2, blocked), false);
  assert.equal(checkoutAllowed("2027-01-01", "2027-02-01", 2, []), false);
});
