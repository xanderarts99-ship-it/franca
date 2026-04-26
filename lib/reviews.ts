import { prisma } from "@/lib/prisma";
import type { Review } from "@prisma/client";

export interface ReviewWithProperty extends Review {
  property: { name: string };
}

export async function getPropertyReviewStats(
  propertyId: string
): Promise<{ averageRating: number; totalReviews: number }> {
  const result = await prisma.review.aggregate({
    where: { propertyId },
    _avg: { rating: true },
    _count: { id: true },
  });
  return {
    averageRating: result._avg.rating ?? 0,
    totalReviews: result._count.id,
  };
}

export async function getFeaturedReviews(limit = 6): Promise<ReviewWithProperty[]> {
  return prisma.review.findMany({
    where: { featured: true },
    orderBy: { reviewDate: "desc" },
    take: limit,
    include: { property: { select: { name: true } } },
  });
}

export async function getPropertyReviews(
  propertyId: string,
  page = 1,
  limit = 20
): Promise<{ reviews: Review[]; total: number }> {
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { propertyId },
      orderBy: { reviewDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { propertyId } }),
  ]);
  return { reviews, total };
}
