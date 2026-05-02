import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateBookingTotal } from "@/lib/pricing";

const querySchema = z.object({
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function parseDateLocal(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);

  const parsed = querySchema.safeParse({
    checkIn: searchParams.get("checkIn"),
    checkOut: searchParams.get("checkOut"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "checkIn and checkOut are required (YYYY-MM-DD)" }, { status: 400 });
  }

  const checkIn = parseDateLocal(parsed.data.checkIn);
  const checkOut = parseDateLocal(parsed.data.checkOut);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkIn < today) {
    return NextResponse.json({ error: "checkIn must not be in the past" }, { status: 400 });
  }

  if (checkIn >= checkOut) {
    return NextResponse.json({ error: "checkOut must be after checkIn" }, { status: 400 });
  }

  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000);

  try {
    const result = await calculateBookingTotal(id, checkIn, checkOut);
    return NextResponse.json({ ...result, nights });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg === "Property not found") {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    console.error("pricing route error:", err);
    return NextResponse.json({ error: "Failed to calculate pricing" }, { status: 500 });
  }
}
