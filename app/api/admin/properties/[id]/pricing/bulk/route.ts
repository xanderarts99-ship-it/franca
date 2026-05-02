import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const setSchema = z.object({
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1).max(365),
  price: z.number().positive(),
});

const deleteSchema = z.object({
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1).max(365),
});

function parseDateLocal(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = setSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "dates (array, max 365) and price (positive) required" }, { status: 400 });
  }

  const property = await prisma.property.findUnique({ where: { id }, select: { id: true } });
  if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  const { dates, price } = parsed.data;

  for (const dateStr of dates) {
    const dateObj = parseDateLocal(dateStr);
    await prisma.propertyPricing.upsert({
      where: { propertyId_date: { propertyId: id, date: dateObj } },
      update: { price },
      create: { propertyId: id, date: dateObj, price },
    });
  }

  revalidatePath(`/properties/${id}`);

  return NextResponse.json({ count: dates.length });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "dates (array, max 365) required" }, { status: 400 });
  }

  const { dates } = parsed.data;
  const dateObjs = dates.map(parseDateLocal);

  const result = await prisma.propertyPricing.deleteMany({
    where: {
      propertyId: id,
      date: { in: dateObjs },
    },
  });

  revalidatePath(`/properties/${id}`);

  return NextResponse.json({ count: result.count });
}
