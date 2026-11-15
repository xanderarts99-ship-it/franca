-- Additive change for an existing Rammies database. Back up first; see MINIMUM_STAY_GUIDE.md.
-- Run once. An unexpected existing column/table causes a rollback instead of hiding schema drift.
BEGIN;
SET LOCAL search_path = public, pg_catalog;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';
ALTER TABLE "Property" ADD COLUMN "minimumStayNights" INTEGER;
ALTER TABLE "Property" ADD CONSTRAINT "Property_minimumStayNights_check" CHECK ("minimumStayNights" BETWEEN 1 AND 30);
ALTER TABLE "Booking" ADD COLUMN "minimumStayApplied" INTEGER;
-- Existing review-email code already uses this nullable field, absent from the checked-in schema.
-- Some deployed databases may already have it.
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "reviewRequestSentAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_minimumStayApplied_check" CHECK ("minimumStayApplied" BETWEEN 1 AND 30);
CREATE TABLE "StaySettings" (
  "id" TEXT PRIMARY KEY DEFAULT 'default' CHECK ("id" = 'default'),
  "minimumNights" INTEGER NOT NULL DEFAULT 2 CHECK ("minimumNights" BETWEEN 1 AND 30),
  "version" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "StaySettings" ("id") VALUES ('default');
CREATE TABLE "StayRule" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "propertyId" TEXT REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "minimumNights" INTEGER NOT NULL CHECK ("minimumNights" BETWEEN 1 AND 30),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StayRule_dates_check" CHECK ("endDate" >= "startDate")
);
CREATE INDEX "StayRule_propertyId_startDate_endDate_idx" ON "StayRule" ("propertyId", "startDate", "endDate");
CREATE TABLE "PaymentReview" (
  "id" TEXT PRIMARY KEY,
  "paymentIntentId" TEXT NOT NULL UNIQUE,
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Prisma's server DB role must own these tables or have BYPASSRLS.
-- No browser/Data API writes; application routes authorize every mutation.
ALTER TABLE "StaySettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StayRule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentReview" ENABLE ROW LEVEL SECURITY;
COMMIT;
