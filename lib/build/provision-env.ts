/**
 * Build steps 13-14: Set auto and placeholder env vars on the Vercel project.
 *
 * Step 13 sets all auto-provisioned env vars (secrets, API keys, service URLs).
 * Step 14 sets placeholder values for vars that require manual setup (Clerk, Stripe).
 */

import { setEnvVar } from "@/lib/build/vercel-api";
import { prisma } from "@/lib/db";
import { BRAND_EMAIL } from "@/lib/brand";
import crypto from "crypto";

export interface ProvisionEnvParams {
  projectId: string;
  repoName: string | null;
  vercelProjectId: string | null;
  sentryDsn: string | null;
  sentryProjectSlug: string | null;
  resendKeyId: string | null;
  resendToken: string | null;
  stripeConnectAccountId: string | null;
  clerkPublishableKey: string | null;
  clerkSecretKey: string | null;
  selectedFeatures: string[] | null;
  buildChecklist: Record<string, boolean>;
  appendLog: (msg: string) => void;
  saveProgress: (extra?: Record<string, unknown>) => Promise<void>;
}

export async function provisionAutoEnvVars(params: ProvisionEnvParams): Promise<void> {
  const {
    projectId,
    repoName,
    vercelProjectId,
    sentryDsn,
    sentryProjectSlug,
    resendKeyId,
    resendToken,
    stripeConnectAccountId,
    clerkPublishableKey,
    clerkSecretKey,
    buildChecklist,
    appendLog,
    saveProgress,
  } = params;

  if (buildChecklist.envVarsAutoSet || !vercelProjectId || !process.env.WS_VERCEL_TOKEN) return;

  try {
    const clientUrl = `https://${repoName}.vercel.app`;
    const cronSecret = crypto.randomBytes(32).toString("hex");

    // Use dedicated per-client Resend key if provisioned, else fall back to shared
    const resendApiKey = resendToken ?? process.env.RESEND_API_KEY;
    const usingDedicatedResend = !!resendToken;

    const autoVars: Record<string, string | undefined> = {
      // App URL
      NEXT_PUBLIC_APP_URL: clientUrl,

      // Clerk -- auto-provisioned keys if Platform API available
      ...(clerkPublishableKey && clerkSecretKey ? {
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: clerkPublishableKey,
        CLERK_SECRET_KEY: clerkSecretKey,
      } : {}),

      // Clerk redirect URLs (standard)
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: "/client-portal",
      NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: "/client-portal",

      // Cron auth -- unique per client
      CRON_SECRET: cronSecret,

      // AI keys -- Anthropic is shared (no programmatic key creation API).
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,

      // Email -- dedicated per-client key when available
      RESEND_API_KEY: resendApiKey,
      RESEND_FROM_EMAIL: BRAND_EMAIL,

      // Error monitoring -- dedicated per-client Sentry project when available
      ...(sentryDsn ? {
        SENTRY_DSN: sentryDsn,
        NEXT_PUBLIC_SENTRY_DSN: sentryDsn,
      } : {}),

      // Stripe Connect -- set connected account ID + platform fee if provisioned
      ...(stripeConnectAccountId ? {
        STRIPE_CONNECT_ACCOUNT_ID: stripeConnectAccountId,
        PLATFORM_FEE_PERCENT: "2.5",
      } : {}),
    };

    const setPromises = Object.entries(autoVars)
      .filter(([, v]) => Boolean(v))
      .map(([k, v]) => setEnvVar(vercelProjectId!, k, v!));

    await Promise.all(setPromises);

    // Persist service key references for cost-tracking queries
    const serviceKeys = {
      resend: resendKeyId
        ? { keyId: resendKeyId, dedicated: true }
        : { keyId: null, dedicated: false, note: "using shared Wholesail key" },
      sentry: sentryProjectSlug
        ? { projectSlug: sentryProjectSlug, dedicated: true }
        : { projectSlug: null, dedicated: false, note: "project creation failed or skipped" },
      anthropic: {
        keyId: null,
        dedicated: false,
        note: "shared key -- no programmatic creation API; attribute via metadata",
      },
    };

    await prisma.project.update({
      where: { id: projectId },
      data: { serviceKeys },
    });

    buildChecklist.envVarsAutoSet = true;
    const varCount = Object.keys(autoVars).filter(k => autoVars[k]).length;
    appendLog(
      `Env vars set (${varCount} vars) -- Resend: ${usingDedicatedResend ? "dedicated key" : "shared key (fallback)"}`
    );
    await saveProgress();
  } catch (envErr) {
    appendLog(`Auto env var error: ${(envErr as Error).message}`);
    await saveProgress();
  }
}

export async function provisionPlaceholderEnvVars(params: ProvisionEnvParams): Promise<void> {
  const {
    projectId,
    vercelProjectId,
    stripeConnectAccountId,
    clerkPublishableKey,
    clerkSecretKey,
    sentryDsn,
    resendKeyId,
    selectedFeatures,
    buildChecklist,
    appendLog,
    saveProgress,
  } = params;

  if (buildChecklist.envVarsPlaceholderSet || !vercelProjectId || !process.env.WS_VERCEL_TOKEN) return;

  try {
    const placeholders: Record<string, string> = {};

    // Only add Clerk placeholders if NOT auto-provisioned via Platform API
    if (!clerkPublishableKey) {
      placeholders.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "PENDING_CLERK_SETUP";
      placeholders.CLERK_SECRET_KEY = "PENDING_CLERK_SETUP";
    }
    // Webhook secret always needs manual setup (even with Platform API)
    placeholders.CLERK_WEBHOOK_SECRET = "PENDING_CLERK_WEBHOOK";

    // Only add Stripe placeholders if Connect was NOT successfully provisioned
    if (!stripeConnectAccountId) {
      placeholders.STRIPE_SECRET_KEY = "PENDING_CLIENT_STRIPE";
      placeholders.STRIPE_WEBHOOK_SECRET = "PENDING_CLIENT_STRIPE";
    }

    // Only set Bloo.io placeholders if SMS ordering was requested
    const features = selectedFeatures ?? [];
    const hasSMS = features.some((f: string) =>
      f.toLowerCase().includes("sms") || f.toLowerCase().includes("bloo")
    );
    if (hasSMS) {
      placeholders.BLOOIO_API_KEY = "PENDING_BLOOIO_SETUP";
      placeholders.BLOOIO_PHONE_NUMBER = "PENDING_BLOOIO_SETUP";
      placeholders.BLOOIO_WEBHOOK_SECRET = "PENDING_BLOOIO_SETUP";
    }

    await Promise.all(
      Object.entries(placeholders).map(([k, v]) => setEnvVar(vercelProjectId!, k, v))
    );

    // Track env var status on project for the dashboard
    const envVarStatus: Record<string, string> = {
      DATABASE_URL: "configured",
      DATABASE_URL_UNPOOLED: "configured",
      UPSTASH_REDIS_REST_URL: "configured",
      UPSTASH_REDIS_REST_TOKEN: "configured",
      CRON_SECRET: "configured",
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? "configured-shared" : "missing",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "configured-shared" : "missing",
      RESEND_API_KEY: resendKeyId ? "configured-dedicated" : (process.env.RESEND_API_KEY ? "configured-shared" : "missing"),
      SENTRY_DSN: sentryDsn ? "configured-dedicated" : "not-configured",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: clerkPublishableKey ? "configured" : "pending",
      CLERK_SECRET_KEY: clerkSecretKey ? "configured" : "pending",
      CLERK_WEBHOOK_SECRET: "pending",
      ...(stripeConnectAccountId ? {
        STRIPE_CONNECT_ACCOUNT_ID: "configured",
        PLATFORM_FEE_PERCENT: "configured",
      } : {
        STRIPE_SECRET_KEY: "pending",
        STRIPE_WEBHOOK_SECRET: "pending",
      }),
      ...(hasSMS ? {
        BLOOIO_API_KEY: "pending",
        BLOOIO_PHONE_NUMBER: "pending",
        BLOOIO_WEBHOOK_SECRET: "pending",
      } : {}),
    };

    await prisma.project.update({
      where: { id: projectId },
      data: { envVars: envVarStatus },
    });

    buildChecklist.envVarsPlaceholderSet = true;
    appendLog("Placeholder env vars set (Clerk + Stripe pending admin/client)");
    await saveProgress();
  } catch (phErr) {
    appendLog(`Placeholder env var error: ${(phErr as Error).message}`);
    await saveProgress();
  }
}
