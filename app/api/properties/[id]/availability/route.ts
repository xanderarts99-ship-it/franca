import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBlockedDatesForProperty } from "@/lib/availability";
import { expireStaleBookings } from "@/lib/bookings";

const querySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = request.nextUrl;

  // Clean up stale pending bookings so freed dates appear available
  await expireStaleBookings().catch((err) =>
    console.error("expireStaleBookings error:", err)
  );

  const parsed = querySchema.safeParse({
    month: searchParams.get("month"),
    year: searchParams.get("year"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          "Invalid query parameters. Provide month (1–12) and year (YYYY).",
      },
      { status: 400 }
    );
  }

  const { month, year } = parsed.data;

  try {
    const blockedDates = await getBlockedDatesForProperty(id, month, year);
    return NextResponse.json({ blockedDates });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch availability. Please try again." },
      { status: 500 }
    );
  }
}
