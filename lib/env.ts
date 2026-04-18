import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL:           z.string().min(1, "DATABASE_URL is required"),
  NEXTAUTH_SECRET:        z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL:           z.string().url().optional(),
  // Added when Stripe is wired
  STRIPE_SECRET_KEY:           z.string().optional(),
  STRIPE_WEBHOOK_SECRET:       z.string().optional(),
  // Added when Cloudinary is wired
  CLOUDINARY_CLOUD_NAME:  z.string().optional(),
  CLOUDINARY_API_KEY:     z.string().optional(),
  CLOUDINARY_API_SECRET:  z.string().optional(),
  // Added when Resend is wired
  RESEND_API_KEY:         z.string().optional(),
  RESEND_FROM_EMAIL:      z.string().email().optional(),
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
