import { randomBytes } from "crypto";
import { prisma } from "./prisma";

// Excludes ambiguous characters: 0, O, 1, I
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSuffix(): string {
  const bytes = randomBytes(6);
  return Array.from(bytes)
    .map((b) => CHARS[b % CHARS.length])
    .join("");
}

export async function generateBookingReference(): Promise<string> {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 10; attempt++) {
    const ref = `VR-${year}-${randomSuffix()}`;
    const existing = await prisma.booking.findUnique({
      where: { bookingReference: ref },
      select: { id: true },
    });
    if (!existing) return ref;
  }
  throw new Error("Failed to generate unique booking reference after 10 attempts");
}
