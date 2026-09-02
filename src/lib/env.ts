import { z } from "zod";

/**
 * Environment variable validation.
 * Per security.md §7: NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are the only public values.
 * Secret key, Sentry auth token live in Vercel/GitHub encrypted env
 * and are never referenced in client code.
 */
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_ENV: z
    .enum(["development", "preview", "production"])
    .default("development"),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  // Server-only (never exposed to client)
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  SUPABASE_DB_URL: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
  CONTENT_PACK_SIGNING_SECRET: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error(
      "❌ Invalid environment variables:",
      result.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables. Check .env file.");
  }
  return result.data;
}

export const env = loadEnv();
