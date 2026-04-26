import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPaginationParams, getPaginationMeta, getPrismaSkip } from "@/lib/pagination";
import { revalidatePath } from "next/cache";

const reviewSchema = z.object({
  propertyId: z.string().min(1),
  guestName: z.string().min(2).max(100),
  guestLocation: z.string().max(100).optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
  reviewDate: z.string().refine((d) => {
    const date = new Date(d);
    return !isNaN(date.getTime()) && date <= new Date();
  }, "Review date must be a valid date and cannot be in the future"),
  featured: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const propertyId = searchParams.get("propertyId") ?? undefined;
  const featured = searchParams.get("featured");
  const ratingFilter = searchParams.get("rating");

  const params = getPaginationParams(
    Object.fromEntries(searchParams.entries()),
    10
  );

  const where = {
    ...(propertyId ? { propertyId } : {}),
    ...(featured === "true" ? { featured: true } : {}),
    ...(ratingFilter ? { rating: parseInt(ratingFilter) } : {}),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { property: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: getPrismaSkip(params),
      take: params.limit,
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      propertyId: r.propertyId,
      propertyName: r.property.name,
      guestName: r.guestName,
      guestLocation: r.guestLocation,
      rating: r.rating,
      comment: r.comment,
      reviewDate: r.reviewDate,
      featured: r.featured,
      createdAt: r.createdAt,
    })),
    pagination: getPaginationMeta(total, params),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { reviewDate, ...rest } = parsed.data;
  const review = await prisma.review.create({
    data: { ...rest, reviewDate: new Date(reviewDate) },
    include: { property: { select: { name: true } } },
  });

  revalidatePath("/");
  revalidatePath(`/properties/${review.propertyId}`);

  return NextResponse.json(review, { status: 201 });
}
