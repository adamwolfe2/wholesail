import { z } from "zod";

/**
 * Validates required environment variables at startup.
 * Import this in instrumentation.ts so the app fails fast on missing config
 * rather than crashing at runtime when a route tries to use an undefined key.
 *
 * Optional integrations (Bloo.io, Firecrawl, etc.) are NOT validated here —
 * those check at call-time since they're per-client template features.
 */

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Auth (Clerk)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "Clerk publishable key is required"),
  CLERK_SECRET_KEY: z.string().min(1, "Clerk secret key is required"),

  // Cron auth
  CRON_SECRET: z.string().min(1, "CRON_SECRET is required for cron job auth"),

  // Email (Resend) — optional in dev but required in production
  RESEND_API_KEY: z.string().optional(),

  // Stripe — optional (only needed if payments are enabled)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let _validated = false;

export function validateEnv(): Env {
  if (_validated) return process.env as unknown as Env;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    console.error(
      `\n[env] Missing or invalid environment variables:\n${missing}\n`
    );
    // In production, fail hard. In dev, warn but continue.
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing required environment variables. See logs above.");
    }
  }

  _validated = true;
  return (result.success ? result.data : process.env) as unknown as Env;
}
