import { expect, test } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";

test("additive PostgreSQL change seeds two nights and preserves existing bookings", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `CREATE TABLE "Property" (id TEXT PRIMARY KEY); CREATE TABLE "Booking" (id TEXT PRIMARY KEY, "totalNights" INT NOT NULL, status TEXT); INSERT INTO "Property" VALUES ('home'); INSERT INTO "Booking" VALUES ('old', 1, 'CONFIRMED'), ('pending', 1, 'PENDING_PAYMENT');`,
    );
    await db.exec(
      await readFile(
        new URL("../prisma/changes/minimum-stay.sql", import.meta.url),
        "utf8",
      ),
    );
    expect(
      (await db.query(`SELECT "minimumNights" FROM "StaySettings"`)).rows,
    ).toEqual([{ minimumNights: 2 }]);
    expect(
      (await db.query(`SELECT "minimumStayNights" FROM "Property"`)).rows,
    ).toEqual([{ minimumStayNights: null }]);
    expect(
      (
        await db.query(
          `SELECT "totalNights", status, "minimumStayApplied" FROM "Booking" ORDER BY id`,
        )
      ).rows,
    ).toEqual([
      { totalNights: 1, status: "CONFIRMED", minimumStayApplied: null },
      { totalNights: 1, status: "PENDING_PAYMENT", minimumStayApplied: null },
    ]);
    await expect(
      db.exec(`UPDATE "StaySettings" SET "minimumNights" = 31`),
    ).rejects.toThrow(/check constraint/);
    await expect(
      db.exec(`UPDATE "Property" SET "minimumStayNights" = 0`),
    ).rejects.toThrow(/check constraint/);
    await expect(
      db.exec(
        `INSERT INTO "StayRule" (id, name, "startDate", "endDate", "minimumNights", "updatedAt") VALUES ('bad', 'Bad', '2027-02-02', '2027-02-01', 7, NOW())`,
      ),
    ).rejects.toThrow(/check constraint/);
    expect(
      (
        await db.query(
          `SELECT relname FROM pg_class WHERE relname IN ('StaySettings', 'StayRule', 'PaymentReview') AND relrowsecurity ORDER BY relname`,
        )
      ).rows,
    ).toEqual([
      { relname: "PaymentReview" },
      { relname: "StayRule" },
      { relname: "StaySettings" },
    ]);
  } finally {
    await db.close();
  }
}, 30000);
