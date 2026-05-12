import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordLimiter } from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  const ip =
    (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const { success } = resetPasswordLimiter.check(5, ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

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

  const user = await prisma.adminUser.findFirst({
    where: {
      resetToken: { not: null },
      resetTokenExpiresAt: { gt: new Date() },
    },
    select: { id: true, resetToken: true },
  });

  if (!user || !user.resetToken) {
    return NextResponse.json(
      { error: "This reset link is invalid or has already been used" },
      { status: 400 }
    );
  }

  try {
    const tokenValid = await bcrypt.compare(token, user.resetToken);
    if (!tokenValid) {
      return NextResponse.json(
        { error: "This reset link is invalid or has already been used" },
        { status: 400 }
      );
    }

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
    console.error("[RESET_PASSWORD] Failed to reset password:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
