import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const patchSchema = z.object({
  propertyId: z.string().min(1).optional(),
  guestName: z.string().min(2).max(100).optional(),
  guestLocation: z.string().max(100).optional().nullable(),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(10).max(1000).optional(),
  reviewDate: z
    .string()
    .refine((d) => {
      const date = new Date(d);
      return !isNaN(date.getTime()) && date <= new Date();
    }, "Review date cannot be in the future")
    .optional(),
  featured: z.boolean().optional(),
  approved: z.boolean().optional(),
  hostResponse: z.string().max(1000).optional().nullable(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const review = await prisma.review.findUnique({
    where: { id },
    include: { property: { select: { name: true } } },
  });

  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
  return NextResponse.json(review);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { reviewDate, hostResponse, ...rest } = parsed.data;
  const review = await prisma.review.update({
    where: { id },
    data: {
      ...rest,
      ...(reviewDate ? { reviewDate: new Date(reviewDate) } : {}),
      ...(hostResponse !== undefined
        ? {
            hostResponse: hostResponse || null,
            hostResponseAt: hostResponse ? new Date() : null,
          }
        : {}),
    },
    include: { property: { select: { name: true } } },
  });

  revalidatePath("/");
  revalidatePath(`/properties/${review.propertyId}`);

  return NextResponse.json(review);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  await prisma.review.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath(`/properties/${existing.propertyId}`);

  return NextResponse.json({ success: true });
}
