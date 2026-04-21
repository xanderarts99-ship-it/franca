import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelBooking } from "@/lib/bookings";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { property: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ booking });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json() as { action?: string };

  if (body.action !== "cancel") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const existing = await prisma.booking.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (existing.status === "CANCELLED") {
    return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
  }

  try {
    await cancelBooking(id);
    const updated = await prisma.booking.findUnique({ where: { id }, include: { property: true } });
    return NextResponse.json({ booking: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
