/**
 * Wholesail Stripe Integration — Constants
 */

/** Stripe API version pinned for this project */
export const STRIPE_API_VERSION = "2026-02-25.clover" as const;

/** Default currency */
export const STRIPE_CURRENCY = "usd" as const;

/** Net-term options available for B2B clients */
export const NET_TERM_OPTIONS = [0, 30, 60, 90] as const;
export type NetTermDays = (typeof NET_TERM_OPTIONS)[number];

/** Tax rates by jurisdiction (California focus) */
export const TAX_RATES = {
  /** Default rate — reads from env var with CA rate as fallback */
  CA_DEFAULT: Number(process.env.DEFAULT_TAX_RATE) || 0.0875,
  /** Rate for tax-exempt orgs (restaurant resale, etc.) */
  EXEMPT: 0,
} as const;

/** Volume discount tiers (order subtotal in dollars) */
export const VOLUME_DISCOUNT_TIERS = [
  { minSubtotalDollars: 5000, pct: 5 },
  { minSubtotalDollars: 10000, pct: 8 },
  { minSubtotalDollars: 25000, pct: 12 },
] as const;

/** Webhook event types we handle */
export const HANDLED_WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "checkout.session.expired",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.finalized",
  "customer.subscription.deleted",
  "charge.dispute.created",
] as const;

export type HandledWebhookEvent = (typeof HANDLED_WEBHOOK_EVENTS)[number];

/** Stripe statement descriptor (max 22 chars) */
export const STATEMENT_DESCRIPTOR = "WHOLESAIL";

/** Maximum invoice line items Stripe allows */
export const MAX_INVOICE_LINE_ITEMS = 250;
