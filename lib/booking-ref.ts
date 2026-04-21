import { prisma } from "./prisma";

// Excludes ambiguous characters: 0, O, 1, I
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomSuffix(): string {
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return s;
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
