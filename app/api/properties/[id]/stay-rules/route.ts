import { NextResponse } from "next/server";
import { getStayPolicy } from "@/lib/stay-policy";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return NextResponse.json(await getStayPolicy((await params).id), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Stay rules could not be loaded. Please retry." },
      { status: 503 },
    );
  }
}
