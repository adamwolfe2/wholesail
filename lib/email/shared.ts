// ---------------------------------------------------------------------------
// Shared email infrastructure: Resend client, validation, base HTML template,
// brand constants, and notification-preference helpers.
// ---------------------------------------------------------------------------
import { Resend } from "resend";
import { getSiteUrl } from "../get-site-url";
import { portalConfig } from "@/lib/portal-config";

// ---------------------------------------------------------------------------
// Brand constants (used by every domain email module)
// ---------------------------------------------------------------------------

export const FROM_EMAIL = portalConfig.fromEmail;
export const APP_URL = getSiteUrl();
export const OPS_NAME = portalConfig.opsName;
export const BRAND_NAME = portalConfig.brandNameServer;
export const BRAND_LOCATION = portalConfig.brandLocation;
export const BRAND_EMAIL = portalConfig.adminEmail;
export const BRAND_COLOR = portalConfig.primaryColor;

// ---------------------------------------------------------------------------
// Resend client
// ---------------------------------------------------------------------------

export function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function isValidEmail(email: string | undefined | null): email is string {
  return !!email && email.includes('@');
}

// ---------------------------------------------------------------------------
// buildBaseHtml -- branded email shell used by every transactional email.
// ---------------------------------------------------------------------------

export interface BaseHtmlOptions {
  headline: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  /** Optional amber banner shown above the header (e.g. payment reminders) */
  alertBannerHtml?: string;
  /** If true, includes a one-click unsubscribe link in the footer (CAN-SPAM). Use for marketing/nurture emails, not transactional. */
  includeUnsubscribe?: boolean;
  /** Override the outer background, inner bg, header bg, text colours etc. for dark-themed internal emails. */
  theme?: {
    outerBg?: string;
    innerBg?: string;
    headerBg?: string;
    headerText?: string;
    footerBg?: string;
    footerText?: string;
    footerSubText?: string;
    headlineColor?: string;
    border?: string;
  };
}

export function buildBaseHtml({
  headline,
  bodyHtml,
  ctaText,
  ctaUrl,
  alertBannerHtml,
  includeUnsubscribe,
  theme,
}: BaseHtmlOptions): string {
  const outerBg = theme?.outerBg ?? "#F9F7F4";
  const innerBg = theme?.innerBg ?? "#FFFFFF";
  const headerBg = theme?.headerBg ?? BRAND_COLOR;
  const headerText = theme?.headerText ?? "#FFFFFF";
  const footerBg = theme?.footerBg ?? "#F9F7F4";
  const footerText = theme?.footerText ?? "#0A0A0A";
  const footerSubText = theme?.footerSubText ?? "#C8C0B4";
  const headlineColor = theme?.headlineColor ?? "#0A0A0A";
  const border = theme?.border ?? "#E5E1DB";

  const ctaBlock =
    ctaText && ctaUrl
      ? `<tr><td style="padding:8px 32px 32px;">
          <a href="${ctaUrl}" style="display:inline-block;background-color:${BRAND_COLOR};color:#FFFFFF;font-size:13px;font-weight:600;text-decoration:none;padding:14px 28px;letter-spacing:0.06em;text-transform:uppercase;">${ctaText}</a>
        </td></tr>`
      : "";

  const alertBlock = alertBannerHtml
    ? `<tr><td style="background-color:#FFFBEB;border-bottom:2px solid #D97706;padding:14px 32px;">
        ${alertBannerHtml}
      </td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:${outerBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${outerBg};padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${innerBg};border:1px solid ${border};">

        <!-- HEADER: dark bar with brand name -->
        <tr><td style="background-color:${headerBg};padding:24px 32px;">
          <p style="margin:0;color:${headerText};font-size:11px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;">${BRAND_NAME}</p>
        </td></tr>

        <!-- OPTIONAL ALERT BANNER -->
        ${alertBlock}

        <!-- CONTENT AREA -->
        <tr><td style="padding:32px 32px 24px;">
          <h1 style="margin:0 0 20px;color:${headlineColor};font-family:Georgia,serif;font-size:24px;font-weight:700;line-height:1.3;">${headline}</h1>
          ${bodyHtml}
        </td></tr>

        <!-- CTA BUTTON -->
        ${ctaBlock}

        <!-- FOOTER -->
        <tr><td style="padding:20px 32px;border-top:1px solid ${border};background-color:${footerBg};">
          <p style="margin:0;color:${footerText};font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">${BRAND_NAME}</p>
          <p style="margin:4px 0 0;color:${footerSubText};font-size:12px;">${APP_URL.replace(/^https?:\/\//, "")}${BRAND_LOCATION ? ` &nbsp;&middot;&nbsp; ${BRAND_LOCATION}` : ""}</p>
          ${includeUnsubscribe ? `<p style="margin:8px 0 0;"><a href="${APP_URL}/client-portal/settings" style="color:${footerSubText};font-size:11px;text-decoration:underline;">Unsubscribe or manage email preferences</a></p>` : ""}
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Shared interfaces
// ---------------------------------------------------------------------------

export interface OrderEmailData {
  orderNumber: string;
  orderId?: string; // DB id -- used for admin deep-link
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; unitPrice: number; total: number }[];
  subtotal: number;
  total: number;
}

// ---------------------------------------------------------------------------
// shouldSendEmail -- checks org.notificationPrefs before sending.
// Call this before any marketing or transactional send to respect client prefs.
//
// Usage:
//   if (!shouldSendEmail(org.notificationPrefs, 'orders')) return
//   await sendOrderConfirmation(...)
// ---------------------------------------------------------------------------

export function shouldSendEmail(
  prefs:
    | { emailDropAlerts?: boolean; emailOrderUpdates?: boolean; emailWeeklyDigest?: boolean }
    | null
    | undefined,
  type: "drops" | "orders" | "weekly"
): boolean {
  // Default to true if prefs are not set (opt-in by default)
  if (!prefs) return true;

  switch (type) {
    case "drops":
      return prefs.emailDropAlerts !== false;
    case "orders":
      return prefs.emailOrderUpdates !== false;
    case "weekly":
      return prefs.emailWeeklyDigest !== false;
    default:
      return true;
  }
}
