import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const dateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});

function toUtcDay(dateStr: string): { gte: Date; lte: Date } {
  return {
    gte: new Date(dateStr + "T00:00:00.000Z"),
    lte: new Date(dateStr + "T23:59:59.999Z"),
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: propertyId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = dateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const { date } = parsed.data;
  const dateRange = toUtcDay(date);

  const existingManual = await prisma.blockedDate.findFirst({
    where: { propertyId, date: dateRange, reason: "MANUAL" },
  });
  if (existingManual) {
    return NextResponse.json({ error: "Date is already blocked" }, { status: 409 });
  }

  const bookingBlock = await prisma.blockedDate.findFirst({
    where: { propertyId, date: dateRange, reason: "BOOKING" },
    include: { booking: { select: { status: true } } },
  });
  if (bookingBlock?.booking?.status === "CONFIRMED") {
    return NextResponse.json(
      {
        error:
          "Date is covered by a confirmed booking — cancel the booking to free this date",
      },
      { status: 409 }
    );
  }

  try {
    const record = await prisma.blockedDate.create({
      data: {
        propertyId,
        date: new Date(date + "T00:00:00.000Z"),
        reason: "MANUAL",
      },
    });
    return NextResponse.json(record, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to block date" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: propertyId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = dateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const { date } = parsed.data;
  const dateRange = toUtcDay(date);

  const record = await prisma.blockedDate.findFirst({
    where: { propertyId, date: dateRange },
  });

  if (!record) {
    return NextResponse.json(
      { error: "No manual block found for this date" },
      { status: 404 }
    );
  }

  if (record.reason === "BOOKING") {
    return NextResponse.json(
      {
        error:
          "Cannot unblock a booking date from here — cancel the booking instead",
      },
      { status: 400 }
    );
  }

  if (record.reason === "EXTERNAL") {
    return NextResponse.json(
      { error: "Cannot unblock an external (iCal) date from here" },
      { status: 400 }
    );
  }

  try {
    await prisma.blockedDate.delete({ where: { id: record.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to unblock date" }, { status: 500 });
  }
}
