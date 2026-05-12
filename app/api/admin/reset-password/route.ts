import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { token, newPassword } = parsed.data;

  // Find the user that has a non-expired reset token set
  const user = await prisma.adminUser.findFirst({
    where: {
      resetToken: { not: null },
      resetTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!user || !user.resetToken) {
    return NextResponse.json(
      { error: "This reset link is invalid or has already been used." },
      { status: 400 }
    );
  }

  const tokenValid = await bcrypt.compare(token, user.resetToken);
  if (!tokenValid) {
    return NextResponse.json(
      { error: "This reset link is invalid or has already been used." },
      { status: 400 }
    );
  }

  try {
    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        passwordHash: hash,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });
  } catch (err) {
    console.error("[RESET_PASSWORD] Failed to update password:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
