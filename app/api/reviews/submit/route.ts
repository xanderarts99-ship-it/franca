import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { reviewLimiter } from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(1),
  guestName: z.string().min(1).max(100),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const { success } = reviewLimiter.check(3, ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { token, guestName, rating, comment } = parsed.data;

  const booking = await prisma.booking.findUnique({
    where: { reviewToken: token },
    select: {
      id: true,
      propertyId: true,
      reviewSubmittedAt: true,
      reviewTokenExpiresAt: true,
      status: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Invalid or expired review link" }, { status: 404 });
  }

  if (booking.reviewSubmittedAt) {
    return NextResponse.json({ error: "Review already submitted" }, { status: 409 });
  }

  if (booking.reviewTokenExpiresAt && booking.reviewTokenExpiresAt < new Date()) {
    return NextResponse.json({ error: "This review link has expired" }, { status: 410 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        propertyId: booking.propertyId,
        guestName,
        rating,
        comment,
        reviewDate: new Date(),
        approved: false,
        featured: false,
      },
    });

    await tx.booking.update({
      where: { id: booking.id },
      data: { reviewSubmittedAt: new Date() },
    });
  });

  return NextResponse.json({ success: true });
}
