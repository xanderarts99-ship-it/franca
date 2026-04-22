import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100).optional(),
  location: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  nightlyRate: z
    .number()
    .positive()
    .refine((n) => Math.round(n * 100) === n * 100, "Max 2 decimal places")
    .optional(),
  amenities: z.array(z.string().max(50)).max(20).optional(),
  guests: z
    .number()
    .refine(Number.isInteger, "Must be a whole number")
    .refine((n) => n >= 1 && n <= 20, "Must be between 1 and 20")
    .optional(),
  bedrooms: z
    .number()
    .refine(Number.isInteger, "Must be a whole number")
    .refine((n) => n >= 0 && n <= 20, "Must be between 0 and 20")
    .optional(),
  beds: z
    .number()
    .refine(Number.isInteger, "Must be a whole number")
    .refine((n) => n >= 1 && n <= 30, "Must be between 1 and 30")
    .optional(),
  bathrooms: z
    .number()
    .refine(Number.isInteger, "Must be a whole number")
    .refine((n) => n >= 0 && n <= 20, "Must be between 0 and 20")
    .optional(),
  images: z.array(z.string().url()).max(40).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const property = await prisma.property.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  try {
    const updated = await prisma.property.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}
