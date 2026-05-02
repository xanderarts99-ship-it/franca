import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  fullRefundDays: z.number().int().min(0),
  partialRefundDays: z.number().int().min(0).nullable().optional(),
  partialRefundPercentage: z.number().int().min(1).max(99).nullable().optional(),
  policyText: z.string().min(1).max(2000),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const policies = await prisma.cancellationPolicy.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(policies);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  const policy = await prisma.cancellationPolicy.create({ data: parsed.data });
  return NextResponse.json(policy, { status: 201 });
}
