import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);

  const parsed = querySchema.safeParse({
    month: searchParams.get("month"),
    year: searchParams.get("year"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "month (1-12) and year (YYYY) required" },
      { status: 400 }
    );
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

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  return NextResponse.json({
    pricing: pricing.map((p) => ({
      date: p.date.toISOString().slice(0, 10),
      price: Number(p.price),
    })),
    baseRate: Number(property.nightlyRate),
  });
}
