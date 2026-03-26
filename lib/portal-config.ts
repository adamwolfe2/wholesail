/**
 * Per-client portal configuration — single source of truth.
 *
 * Values come from environment variables (set per deployment by the build
 * pipeline). Every per-client configurable value lives here so the rest of
 * the codebase imports from one place instead of scattering process.env reads.
 *
 * Infrastructure secrets (DATABASE_URL, CLERK_SECRET_KEY, STRIPE_SECRET_KEY,
 * etc.) are intentionally NOT included — those belong in lib/env.ts.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function float(envVar: string | undefined, fallback: number): number {
  if (!envVar) return fallback
  const parsed = parseFloat(envVar)
  return Number.isNaN(parsed) ? fallback : parsed
}

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, "")
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export const portalConfig = {
  // Brand identity
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME || "Wholesail",
  /** Server-side brand name (BRAND_NAME env var, falls back to NEXT_PUBLIC_BRAND_NAME) */
  brandNameServer: process.env.BRAND_NAME || process.env.NEXT_PUBLIC_BRAND_NAME || "Wholesail",
  brandLocation: process.env.BRAND_LOCATION || "",

  // URLs
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://wholesailhub.com",
  get appDomain(): string {
    return stripProtocol(this.appUrl)
  },

  // Contact
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "orders@wholesailhub.com",
  adminEmail: process.env.ADMIN_EMAIL || "orders@wholesailhub.com",
  opsName: process.env.OPS_NAME || "our team",
  reportRecipients: process.env.REPORT_RECIPIENTS || "",

  // Styling
  primaryColor: process.env.BRAND_PRIMARY_COLOR || "#0A0A0A",

  // Commerce
  freeDeliveryThreshold: float(process.env.FREE_DELIVERY_THRESHOLD, 500),
  standardDeliveryFee: float(process.env.STANDARD_DELIVERY_FEE, 25),
  defaultTaxRate: float(process.env.DEFAULT_TAX_RATE, 0.0875),

  // Email
  fromEmail: process.env.RESEND_FROM_EMAIL || "Wholesail <noreply@wholesailhub.com>",

  // Cal.com
  calNamespace: process.env.NEXT_PUBLIC_CAL_NAMESPACE || "wholesail",

  // Instagram
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/wholesailhub/",
  instagramHandle: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || "@wholesailhub",

  // Build pipeline
  githubOwner: process.env.GITHUB_OWNER || "adamwolfe2",
  githubTemplateRepo: process.env.GITHUB_TEMPLATE_REPO || "wholesail",
} as const

export type PortalConfig = typeof portalConfig
