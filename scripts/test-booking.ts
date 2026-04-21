import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local before any lib modules that need DATABASE_URL / RESEND_API_KEY
const envPath = resolve(process.cwd(), ".env.local");
try {
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] ??= val;
  }
} catch {
  console.warn("Could not load .env.local — ensure env vars are set");
}

async function main() {
  // Dynamic imports run after env vars are loaded above
  const { prisma } = await import("../lib/prisma");
  const { createBookingFromPayment } = await import("../lib/bookings");

  console.log("── Test Booking Script ──────────────────────────────\n");

  // 1. Grab the first property
  const property = await prisma.property.findFirst({
    select: { id: true, name: true, nightlyRate: true },
  });
  if (!property) {
    console.error("No properties found in database. Please seed first.");
    process.exit(1);
  }
  console.log(`Using property: ${property.name} (${property.id})`);

  // 2. Pick dates 30 days from now, 2 nights
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 30);
  checkIn.setHours(0, 0, 0, 0);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 2);

  const nightlyRate = Number(property.nightlyRate);
  const totalAmount = nightlyRate * 2;

  console.log(`Check-in:  ${checkIn.toDateString()}`);
  console.log(`Check-out: ${checkOut.toDateString()}`);
  console.log(`Total:     $${totalAmount.toFixed(2)}\n`);

  // 3. Create booking
  console.log("Creating booking…");
  const guestEmail = process.env.TEST_GUEST_EMAIL ?? "swankylex@gmail.com";

  let booking;
  try {
    booking = await createBookingFromPayment({
      stripePaymentIntentId: `pi_test_manual_${Date.now()}`,
      propertyId: property.id,
      guestName: "Test Guest",
      guestEmail,
      guestPhone: "+1234567890",
      checkIn,
      checkOut,
      totalAmount,
    });
  } catch (err) {
    console.error("createBookingFromPayment failed:", err);
    process.exit(1);
  }

  console.log(`✓ Booking created`);
  console.log(`  Reference: ${booking.bookingReference}`);
  console.log(`  ID:        ${booking.id}`);
  console.log(`  Status:    ${booking.status}`);
  console.log(`  Email sent to: ${guestEmail}\n`);

  // 4. Verify blocked dates
  const blocked = await prisma.blockedDate.findMany({
    where: { bookingId: booking.id },
    select: { date: true },
    orderBy: { date: "asc" },
  });

  console.log(`✓ Blocked dates created (${blocked.length}):`);
  for (const bd of blocked) {
    const d = bd.date;
    console.log(
      `  ${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    );
  }

  // 5. Show full booking record
  console.log("\n── Booking record ───────────────────────────────────");
  const full = await prisma.booking.findUniqueOrThrow({
    where: { id: booking.id },
    include: { property: { select: { name: true } } },
  });
  console.log(
    JSON.stringify(
      {
        id: full.id,
        reference: full.bookingReference,
        status: full.status,
        property: full.property.name,
        guestName: full.guestName,
        guestEmail: full.guestEmail,
        guestPhone: full.guestPhone,
        checkIn: full.checkIn,
        checkOut: full.checkOut,
        totalNights: full.totalNights,
        totalAmount: Number(full.totalAmount),
        stripePaymentIntentId: full.stripePaymentIntentId,
        createdAt: full.createdAt,
      },
      null,
      2,
    ),
  );

  console.log("\n── Done ─────────────────────────────────────────────");

  await prisma.$disconnect().catch(() => {});
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
