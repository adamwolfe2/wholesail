import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const integrations = [
      {
        name: "Stripe",
        configured: !!(
          process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET
        ),
        description: "Payment processing for orders",
        envVars: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
        docsUrl: "https://dashboard.stripe.com/webhooks",
      },
      {
        name: "Clerk",
        configured: !!(
          process.env.CLERK_SECRET_KEY &&
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        ),
        description: "Authentication & user management",
        envVars: ["CLERK_SECRET_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"],
        docsUrl: "https://dashboard.clerk.com",
      },
      {
        name: "Resend",
        configured: !!process.env.RESEND_API_KEY,
        description: "Transactional email delivery",
        envVars: ["RESEND_API_KEY", "RESEND_FROM_EMAIL"],
        docsUrl: "https://resend.com/api-keys",
      },
      {
        name: "Bloo.io",
        configured: !!(
          process.env.BLOOIO_API_KEY &&
          process.env.BLOOIO_FROM_NUMBER &&
          process.env.BLOOIO_WEBHOOK_SECRET
        ),
        description: "iMessage, SMS & RCS messaging",
        envVars: [
          "BLOOIO_API_KEY",
          "BLOOIO_FROM_NUMBER",
          "BLOOIO_WEBHOOK_SECRET",
        ],
        docsUrl: "https://blooio.com",
      },
      {
        name: "Sentry",
        configured: !!(
          process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG
        ),
        description: "Error tracking & performance monitoring",
        envVars: ["SENTRY_AUTH_TOKEN", "SENTRY_ORG", "SENTRY_PROJECT"],
        docsUrl: "https://sentry.io",
      },
      {
        name: "Upstash KV",
        configured: !!(
          process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
        ),
        description: "Rate limiting on public endpoints",
        envVars: ["KV_REST_API_URL", "KV_REST_API_TOKEN"],
        docsUrl: "https://console.upstash.com",
      },
      {
        name: "Slack",
        configured: !!process.env.SLACK_WEBHOOK_URL,
        description: "Intake & alert notifications",
        envVars: ["SLACK_WEBHOOK_URL"],
        docsUrl: "https://api.slack.com/apps",
      },
      {
        name: "Cal.com",
        configured: !!process.env.CAL_WEBHOOK_SECRET,
        description: "Booking sync for intake calls",
        envVars: ["CAL_WEBHOOK_SECRET", "NEXT_PUBLIC_CAL_LINK"],
        docsUrl: "https://cal.com",
      },
      {
        name: "Anthropic AI",
        configured: !!process.env.ANTHROPIC_API_KEY,
        description: "AI chat assistant & config generation",
        envVars: ["ANTHROPIC_API_KEY"],
        docsUrl: "https://console.anthropic.com",
      },
      {
        name: "Google Gemini",
        configured: !!process.env.GEMINI_API_KEY,
        description: "AI reply suggestions & order parsing",
        envVars: ["GEMINI_API_KEY"],
        docsUrl: "https://ai.google.dev",
      },
      {
        name: "PostHog",
        configured: !!(
          process.env.NEXT_PUBLIC_POSTHOG_KEY &&
          process.env.NEXT_PUBLIC_POSTHOG_HOST
        ),
        description: "Product analytics & event tracking",
        envVars: ["NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST"],
        docsUrl: "https://app.posthog.com",
      },
    ];

    return NextResponse.json({ integrations });
  } catch (error) {
    console.error("Error checking integrations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
