/**
 * Default ProjectTask seed data for new projects.
 * Organized by phase (0-5) matching the operator fulfillment workflow.
 */

export type DefaultTask = {
  label: string;
  description: string;
  phase: number;
  externalUrl?: string;
  automationAction?: string;
};

const CAL_URL = process.env.NEXT_PUBLIC_CAL_URL || "https://cal.com/adamwolfe/wholesail";

export function getDefaultProjectTasks(): DefaultTask[] {
  return [
    // ── Phase 0 — Intake & Scoping ─────────────────────────────────────────
    {
      label: "Review intake submission",
      description:
        "Read the client's intake form, verify company details, industry, and requirements. Mark reviewed when complete.",
      phase: 0,
    },
    {
      label: "Schedule discovery call",
      description:
        "Book a call via Cal.com to discuss requirements, pricing, and timeline.",
      phase: 0,
      externalUrl: CAL_URL,
    },
    {
      label: "Confirm contract & pricing",
      description:
        "Agree on monthly fee, setup cost, and launch timeline. Update project costs in the Costs tab.",
      phase: 0,
    },

    // ── Phase 1 — Automated Build ──────────────────────────────────────────
    {
      label: "Run build pipeline",
      description:
        "Click 'Start Build' on the intake page. The system auto-provisions GitHub, Vercel, Neon, Stripe Connect, and more. Watch for any pending manual actions in the build log.",
      phase: 1,
    },
    {
      label: "Verify build log",
      description:
        "Check the build log for errors. Green = auto-completed, yellow = needs manual setup. Address any failed steps.",
      phase: 1,
    },

    // ── Phase 2 — Manual Configuration ─────────────────────────────────────
    {
      label: "Set up Clerk authentication",
      description:
        "If Clerk wasn't auto-provisioned: create app at clerk.com, copy API keys to Vercel env vars, create webhook endpoint pointing to /api/webhooks/clerk.",
      phase: 2,
      externalUrl: "https://dashboard.clerk.com",
    },
    {
      label: "Configure Clerk webhook",
      description:
        "In Clerk dashboard > Webhooks > Add endpoint. URL: {siteUrl}/api/webhooks/clerk. Events: user.created, user.updated, user.deleted. Copy signing secret to CLERK_WEBHOOK_SECRET env var.",
      phase: 2,
      externalUrl: "https://dashboard.clerk.com",
    },
    {
      label: "Configure Stripe webhook",
      description:
        "In Stripe dashboard > Webhooks > Add endpoint. URL: {siteUrl}/api/webhooks/stripe. Copy signing secret to STRIPE_WEBHOOK_SECRET env var.",
      phase: 2,
      externalUrl: "https://dashboard.stripe.com/webhooks",
      automationAction: "stripe_webhook",
    },
    {
      label: "Verify all env vars configured",
      description:
        "Check the Environment Variables card on this page. Every var should show green (configured). Fix any showing yellow (pending) or red (missing).",
      phase: 2,
      automationAction: "verify_env_vars",
    },
    {
      label: "Connect custom domain",
      description:
        "In Vercel project settings > Domains > Add the client's domain. Update DNS records. Verify SSL certificate is issued.",
      phase: 2,
      automationAction: "add_domain",
    },
    {
      label: "Run database migration",
      description:
        "Vercel auto-runs prisma db push on first deploy. Verify by checking the deployment logs in Vercel for 'Your database is now in sync'.",
      phase: 2,
      automationAction: "verify_migration",
    },

    // ── Phase 3 — Content & Data ───────────────────────────────────────────
    {
      label: "Request client assets",
      description:
        "Send the 'We need your assets' email from the Communications tab. Need: logo (SVG/PNG), product catalog (CSV/spreadsheet), marketing photos, brand colors.",
      phase: 3,
      automationAction: "send_assets_email",
    },
    {
      label: "Import product catalog",
      description:
        "Use Admin > Products > Import CSV to bulk-import the client's product list. Verify categories, prices, and images after import.",
      phase: 3,
    },
    {
      label: "Upload logo & branding",
      description:
        "Update the client's portal logo, favicon, and brand colors. Set NEXT_PUBLIC_BRAND_NAME and BRAND_PRIMARY_COLOR env vars.",
      phase: 3,
    },
    {
      label: "Populate marketing content",
      description:
        "If the client has a marketing landing page, update hero text, features section, and testimonials. The CLAUDE.md in their repo has AI-generated suggestions.",
      phase: 3,
    },
    {
      label: "Create first admin user",
      description:
        "Invite the client's admin user via Clerk. They should receive an email to set up their password and access the admin dashboard.",
      phase: 3,
    },

    // ── Phase 4 — QA & Review ──────────────────────────────────────────────
    {
      label: "Test authentication flow",
      description:
        "Sign in as a test user. Verify sign-up, sign-in, and role-based access (admin vs client) all work correctly.",
      phase: 4,
    },
    {
      label: "Test order flow end-to-end",
      description:
        "Place a test order through the client portal: browse catalog > add to cart > checkout > verify order appears in admin. Use Stripe test mode.",
      phase: 4,
    },
    {
      label: "Test invoice & payment flow",
      description:
        "Generate an invoice for the test order. Verify PDF generation, email delivery, and Stripe payment link.",
      phase: 4,
    },
    {
      label: "Test email notifications",
      description:
        "Verify order confirmation, invoice reminders, and welcome emails are sending from the correct from address with the client's branding.",
      phase: 4,
    },
    {
      label: "Verify mobile responsiveness",
      description:
        "Open the client portal on a phone or use Chrome DevTools mobile view. Check catalog, cart, checkout, and dashboard pages.",
      phase: 4,
    },
    {
      label: "Verify domain & SSL",
      description:
        "Visit the custom domain in a browser. Verify HTTPS, correct SSL certificate, and no mixed content warnings.",
      phase: 4,
      automationAction: "verify_ssl",
    },
    {
      label: "Run Lighthouse audit",
      description:
        "Open Chrome DevTools > Lighthouse > Run audit on the homepage. Target: Performance >80, Accessibility >90, SEO >90.",
      phase: 4,
      automationAction: "lighthouse_audit",
    },

    // ── Phase 5 — Launch ───────────────────────────────────────────────────
    {
      label: "Send client review link",
      description:
        "Send the 'Ready for your review' email with the staging URL. Ask client to verify branding, products, and test an order.",
      phase: 5,
      automationAction: "send_review_email",
    },
    {
      label: "Client approval received",
      description:
        "Client has reviewed and approved the portal. Document any change requests in the notes.",
      phase: 5,
    },
    {
      label: "Switch to production",
      description:
        "Update all env vars from test/dev to production values: Stripe live keys, production Clerk keys, production domain.",
      phase: 5,
    },
    {
      label: "Send 'Portal is live' email",
      description:
        "Send the launch announcement email to the client with their portal URL, admin login instructions, and support contact.",
      phase: 5,
      automationAction: "send_live_email",
    },
    {
      label: "Mark project as LIVE",
      description:
        "Change project status to LIVE using the status dropdown. This records the launch date automatically.",
      phase: 5,
      automationAction: "mark_live",
    },
  ];
}

export const PHASE_LABELS: Record<number, string> = {
  0: "Intake & Scoping",
  1: "Automated Build",
  2: "Manual Configuration",
  3: "Content & Data",
  4: "QA & Review",
  5: "Launch",
};
