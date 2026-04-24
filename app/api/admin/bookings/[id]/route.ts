import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelBooking, confirmBooking, rejectBooking } from "@/lib/bookings";

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
  const body = await request.json() as {
    action?: string;
    paymentNotes?: string;
    rejectionReason?: string;
  };

  if (!body.action) {
    return NextResponse.json({ error: "action is required" }, { status: 400 });
  }

  // ── Confirm payment received ────────────────────────────────────
  if (body.action === "confirm") {
    try {
      const updated = await confirmBooking(id, body.paymentNotes);
      return NextResponse.json({ booking: updated });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to confirm booking";
      const status =
        message === "Booking not found" ? 404
        : message.includes("no longer available") ? 409
        : 400;
      return NextResponse.json({ error: message }, { status });
    }
  }

  // ── Reject booking request ──────────────────────────────────────
  if (body.action === "reject") {
    try {
      const updated = await rejectBooking(id, body.rejectionReason);
      return NextResponse.json({ booking: updated });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reject booking";
      const status = message === "Booking not found" ? 404 : 400;
      return NextResponse.json({ error: message }, { status });
    }
  }

  // ── Cancel confirmed booking ────────────────────────────────────
  if (body.action === "cancel") {
    const existing = await prisma.booking.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (existing.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Only confirmed bookings can be cancelled" },
        { status: 400 }
      );
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

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
