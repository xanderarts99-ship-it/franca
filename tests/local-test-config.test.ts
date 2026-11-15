import { expect, test } from "vitest";
import { assertLocalTestUrl, baselineSchema } from "../scripts/local-test-config.mjs";
import { readFileSync } from "node:fs";

test("local setup cannot target the live database or the usual Postgres port", () => {
  expect(() => assertLocalTestUrl("postgresql://test:password@127.0.0.1:55432/rammies_test")).not.toThrow();
  for (const url of ["postgresql://test:password@db.example.com:55432/rammies_test", "postgresql://test:password@127.0.0.1:5432/rammies_test", "postgresql://test:password@127.0.0.1:55432/production"]) expect(() => assertLocalTestUrl(url)).toThrow();
});
test("fresh local baseline leaves new fields for the actual additive SQL to add", () => {
  const schema = baselineSchema(readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8"));
  expect(schema).toContain("model PropertyPricing");
  expect(schema).not.toContain("model StaySettings");
  expect(schema).not.toContain("minimumStayApplied");
  expect(schema).not.toContain("minimumStayNights");
  expect(schema.match(/reviewRequestSentAt/g)).toHaveLength(1); // Existing Review field is retained.
});
