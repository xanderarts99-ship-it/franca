// app/api/admin/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
});

const SUCCESS_RESPONSE = {
  message: "If that email is registered, you'll receive a reset link shortly.",
};

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(SUCCESS_RESPONSE);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    // Return success anyway — don't reveal whether the email exists
    return NextResponse.json(SUCCESS_RESPONSE);
  }

  const { email } = parsed.data;
  const user = await prisma.adminUser.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json(SUCCESS_RESPONSE);
  }

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

  return NextResponse.json(SUCCESS_RESPONSE);
}
