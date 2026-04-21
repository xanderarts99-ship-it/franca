import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    include: { property: { select: { name: true } } },
    orderBy: { checkIn: "asc" },
  });

  return NextResponse.json({
    bookings: bookings.map((b) => ({
      id: b.id,
      bookingReference: b.bookingReference,
      guestName: b.guestName,
      guestEmail: b.guestEmail,
      guestPhone: b.guestPhone,
      propertyId: b.propertyId,
      propertyName: b.property.name,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      totalNights: b.totalNights,
      totalAmount: Number(b.totalAmount),
      status: b.status,
      createdAt: b.createdAt,
    })),
  });
}
