import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReviewRequestEmail } from "@/lib/email";
import { randomUUID } from "crypto";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { property: { include: { cancellationPolicy: true } } },
  });

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.status !== "CONFIRMED") {
    return NextResponse.json({ error: "Booking is not confirmed" }, { status: 400 });
  }
  if (booking.reviewToken && booking.reviewSubmittedAt) {
    return NextResponse.json({ error: "Review already submitted" }, { status: 409 });
  }

  const checkOutDate = new Date(booking.checkOut);
  checkOutDate.setHours(23, 59, 59, 0);
  if (checkOutDate > new Date()) {
    return NextResponse.json({ error: "Guest has not checked out yet" }, { status: 400 });
  }

  const reviewToken = booking.reviewToken ?? randomUUID();

  const updated = await prisma.booking.update({
    where: { id },
    data: { reviewToken, reviewRequestSentAt: new Date() },
    include: { property: { include: { cancellationPolicy: true } } },
  });

  try {
    await sendReviewRequestEmail(updated, reviewToken);
  } catch (err) {
    console.error("sendReviewRequestEmail error:", err);
    return NextResponse.json({ error: "Failed to send review email" }, { status: 500 });
  }

  return NextResponse.json({ success: true, reviewToken });
}
