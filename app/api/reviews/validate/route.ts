import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { reviewToken: token },
    select: {
      reviewSubmittedAt: true,
      guestName: true,
      checkIn: true,
      checkOut: true,
      property: { select: { name: true } },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Invalid or expired review link" }, { status: 404 });
  }

  if (booking.reviewSubmittedAt) {
    return NextResponse.json({ error: "Review already submitted" }, { status: 409 });
  }

  return NextResponse.json({
    propertyName: booking.property.name,
    guestName: booking.guestName,
    checkIn: booking.checkIn.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    checkOut: booking.checkOut.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  });
}
