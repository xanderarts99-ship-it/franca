import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaginationParams, getPaginationMeta, getPrismaSkip } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const propertyId = searchParams.get("propertyId");
  const featured = searchParams.get("featured");

  if (!propertyId && featured !== "true") {
    return NextResponse.json(
      { error: "Provide propertyId or featured=true" },
      { status: 400 }
    );
  }

  const params = getPaginationParams(
    Object.fromEntries(searchParams.entries()),
    6
  );
  if (params.limit > 20) params.limit = 20;

  if (featured === "true") {
    const reviews = await prisma.review.findMany({
      where: { featured: true },
      orderBy: { reviewDate: "desc" },
      take: 6,
      include: { property: { select: { name: true } } },
    });
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
      pagination: getPaginationMeta(reviews.length, { page: 1, limit: 6 }),
    });
  }

  const where = { propertyId: propertyId! };
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { reviewDate: "desc" },
      skip: getPrismaSkip(params),
      take: params.limit,
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      propertyId: r.propertyId,
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
