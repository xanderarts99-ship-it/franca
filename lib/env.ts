import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL:           z.string().min(1, "DATABASE_URL is required"),
  NEXTAUTH_SECRET:        z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL:           z.string().url().optional(),
  STRIPE_SECRET_KEY:      z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET:  z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),
  CLOUDINARY_CLOUD_NAME:  z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY:     z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET:  z.string().min(1, "CLOUDINARY_API_SECRET is required"),
  RESEND_API_KEY:         z.string().min(1, "RESEND_API_KEY is required"),
  RESEND_FROM_EMAIL:      z.string().email("RESEND_FROM_EMAIL must be a valid email"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

const _server = serverSchema.safeParse(process.env);
if (!_server.success) {
  console.error("❌  Missing environment variables:\n", _server.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables. Check server logs.");
}

export const env = {
  ..._server.data,
  ...clientSchema.parse({
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  }),
};
