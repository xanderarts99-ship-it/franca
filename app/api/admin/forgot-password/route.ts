// app/api/admin/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordLimiter } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
});

// Always return this message — never reveal whether the email exists
const SUCCESS_RESPONSE = {
  message: "If that email is registered, you'll receive a reset link shortly.",
};

export async function POST(request: NextRequest) {
  const ip =
    (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const { success } = forgotPasswordLimiter.check(5, ip);
  if (!success) {
    return NextResponse.json(SUCCESS_RESPONSE);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(SUCCESS_RESPONSE);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(SUCCESS_RESPONSE);
  }

  const { email } = parsed.data;
  const user = await prisma.adminUser.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json(SUCCESS_RESPONSE);
  }

  try {
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(rawToken, 12);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        resetToken: tokenHash,
        resetTokenExpiresAt: expiresAt,
      },
    });

    const siteUrl =
      process.env.NEXTAUTH_URL ?? "https://www.rammiesvacation.com";
    const resetUrl = `${siteUrl}/admin/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail(user.email, resetUrl);
    console.log("[FORGOT_PASSWORD] Reset email dispatched to:", user.email.replace(/(.{3}).*@/, "$1***@"));
  } catch (err) {
    console.error("[FORGOT_PASSWORD] Failed to generate or store reset token:", err);
  }

  return NextResponse.json(SUCCESS_RESPONSE);
}
