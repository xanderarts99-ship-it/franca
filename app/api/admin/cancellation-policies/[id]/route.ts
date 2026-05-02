import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  fullRefundDays: z.number().int().min(0).optional(),
  partialRefundDays: z.number().int().min(0).nullable().optional(),
  partialRefundPercentage: z.number().int().min(1).max(99).nullable().optional(),
  policyText: z.string().min(1).max(2000).optional(),
  isDefault: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
  }

  const policy = await prisma.cancellationPolicy.findUnique({ where: { id }, select: { id: true } });
  if (!policy) return NextResponse.json({ error: "Policy not found" }, { status: 404 });

  const updated = await prisma.cancellationPolicy.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const inUseCount = await prisma.property.count({ where: { cancellationPolicyId: id } });
  if (inUseCount > 0) {
    return NextResponse.json(
      { error: `This policy is in use by ${inUseCount} propert${inUseCount === 1 ? "y" : "ies"}` },
      { status: 409 }
    );
  }

  await prisma.cancellationPolicy.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
