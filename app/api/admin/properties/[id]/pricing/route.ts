import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const setSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  price: z.number().positive(),
});

const deleteSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const getSchema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020).max(2100),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(request.url);

  const parsed = getSchema.safeParse({
    month: searchParams.get("month"),
    year: searchParams.get("year"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "month (1-12) and year (YYYY) required" }, { status: 400 });
  }

  const { month, year } = parsed.data;
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const [property, pricing] = await Promise.all([
    prisma.property.findUnique({ where: { id }, select: { nightlyRate: true } }),
    prisma.propertyPricing.findMany({
      where: {
        propertyId: id,
        date: { gte: startDate, lte: endDate },
      },
      select: { date: true, price: true },
      orderBy: { date: "asc" },
    }),
  ]);

  if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  return NextResponse.json({
    pricing: pricing.map((p) => ({
      date: p.date.toISOString().slice(0, 10),
      price: Number(p.price),
    })),
    baseRate: Number(property.nightlyRate),
  });
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
    return NextResponse.json({ error: "date (YYYY-MM-DD) and price (positive) required" }, { status: 400 });
  }

  const { date, price } = parsed.data;
  const [y, m, d] = date.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);

  const property = await prisma.property.findUnique({ where: { id }, select: { id: true } });
  if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  const record = await prisma.propertyPricing.upsert({
    where: { propertyId_date: { propertyId: id, date: dateObj } },
    update: { price },
    create: { propertyId: id, date: dateObj, price },
  });

  revalidatePath(`/properties/${id}`);

  return NextResponse.json({
    date: record.date.toISOString().slice(0, 10),
    price: Number(record.price),
  });
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
    return NextResponse.json({ error: "date (YYYY-MM-DD) required" }, { status: 400 });
  }

  const { date } = parsed.data;
  const [y, m, d] = date.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);

  await prisma.propertyPricing.deleteMany({
    where: { propertyId: id, date: dateObj },
  });

  revalidatePath(`/properties/${id}`);

  return NextResponse.json({ success: true });
}
