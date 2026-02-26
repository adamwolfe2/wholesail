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
        name: "Resend",
        configured: !!process.env.RESEND_API_KEY,
        description: "Transactional email delivery",
        envVars: ["RESEND_API_KEY"],
        docsUrl: "https://resend.com/api-keys",
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
