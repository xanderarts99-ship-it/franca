import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaginationParams, getPaginationMeta, getPrismaSkip } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const params = getPaginationParams(
    Object.fromEntries(searchParams.entries()),
    6
  );

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        nightlyRate: true,
        coverImageUrl: true,
        amenities: true,
      },
      orderBy: { createdAt: "asc" },
      skip: getPrismaSkip(params),
      take: params.limit,
    }),
    prisma.property.count(),
  ]);

  return NextResponse.json({
    properties: properties.map((p) => ({
      ...p,
      nightlyRate: Number(p.nightlyRate),
    })),
    pagination: getPaginationMeta(total, params),
  });
}
