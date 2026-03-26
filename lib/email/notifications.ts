/**
 * Intake / build-pipeline notification emails.
 *
 * All emails use the shared buildBaseHtml template from ./index.ts
 * for consistent branding across the entire platform.
 */
import { Resend } from "resend";
import { portalConfig } from "@/lib/portal-config";
import { buildBaseHtml } from "./index";

const FROM = portalConfig.fromEmail;
const ADMIN_EMAIL = portalConfig.adminEmail;
const BRAND_NAME = portalConfig.brandNameServer;
const APP_URL = portalConfig.appUrl;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

function isValidEmail(email: string | undefined | null): email is string {
  return !!email && email.includes("@");
}

function send(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    return Promise.resolve({ success: false, error: "Email service not configured" });
  }
  if (!isValidEmail(opts.to)) {
    return Promise.resolve({ success: false, error: "Invalid email address" });
  }
  return resend.emails.send({ from: FROM, ...opts }).then(
    () => ({ success: true }),
    (err) => {
      const message = err instanceof Error ? err.message : "Send failed";
      return { success: false, error: message };
    }
  );
}

// ---------------------------------------------------------------------------
// Admin: New intake submission
// ---------------------------------------------------------------------------

export function notifyAdminNewIntake(data: {
  companyName: string;
  contactName: string;
  contactEmail: string;
  industry: string;
  featureCount: number;
}) {
  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">A new portal inquiry has been submitted.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F7F4;border:1px solid #E5E1DB;margin-bottom:24px;">
      <tr><td style="padding:12px 16px;font-size:13px;color:#C8C0B4;border-bottom:1px solid #E5E1DB;width:120px;">Company</td><td style="padding:12px 16px;font-size:14px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;font-weight:600;">${data.companyName}</td></tr>
      <tr><td style="padding:12px 16px;font-size:13px;color:#C8C0B4;border-bottom:1px solid #E5E1DB;">Contact</td><td style="padding:12px 16px;font-size:14px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;">${data.contactName} (${data.contactEmail})</td></tr>
      <tr><td style="padding:12px 16px;font-size:13px;color:#C8C0B4;border-bottom:1px solid #E5E1DB;">Industry</td><td style="padding:12px 16px;font-size:14px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;">${data.industry}</td></tr>
      <tr><td style="padding:12px 16px;font-size:13px;color:#C8C0B4;">Features</td><td style="padding:12px 16px;font-size:14px;color:#0A0A0A;">${data.featureCount} selected</td></tr>
    </table>
  `;

  const html = buildBaseHtml({
    headline: "New Intake Submission",
    bodyHtml,
    ctaText: "View in Admin Dashboard",
    ctaUrl: `${APP_URL}/admin`,
  });

  return send({
    to: ADMIN_EMAIL,
    subject: `New portal inquiry: ${data.companyName}`,
    html,
    text: `New portal inquiry from ${data.companyName}.\nContact: ${data.contactName} (${data.contactEmail})\nIndustry: ${data.industry}\nFeatures: ${data.featureCount} selected\n\nView in admin: ${APP_URL}/admin`,
  });
}

// ---------------------------------------------------------------------------
// Client: Intake confirmation
// ---------------------------------------------------------------------------

export function sendIntakeConfirmation(data: {
  contactName: string;
  contactEmail: string;
  companyName: string;
}) {
  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.contactName},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">
      We've received your portal inquiry for <strong style="color:#0A0A0A;">${data.companyName}</strong>.
      Our team will review your submission and reach out within 24 hours to schedule your consultation call.
    </p>
    <p style="margin:0 0 8px;font-size:15px;color:#3D3833;line-height:1.6;">
      In the meantime, you can check your build status anytime:
    </p>
  `;

  const html = buildBaseHtml({
    headline: `Thanks, ${data.contactName}.`,
    bodyHtml,
    ctaText: "Check Build Status",
    ctaUrl: `${APP_URL}/status`,
  });

  return send({
    to: data.contactEmail,
    subject: `We received your info, ${data.contactName}`,
    html,
    text: `Hi ${data.contactName},\n\nWe've received your portal inquiry for ${data.companyName}. Our team will review your submission and reach out within 24 hours.\n\nCheck your build status: ${APP_URL}/status\n\n-- The ${BRAND_NAME} Team`,
  });
}

// ---------------------------------------------------------------------------
// Client: Intake nurture (Day 3 -- no call booked yet)
// ---------------------------------------------------------------------------

export function sendIntakeNurtureDay3(data: {
  contactName: string;
  contactEmail: string;
  companyName: string;
}) {
  const calLink = process.env.NEXT_PUBLIC_CAL_LINK ?? "adamwolfe/wholesail";
  const bookingUrl = `https://app.cal.com/${calLink}`;

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.contactName},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">
      A few days ago you submitted portal details for <strong style="color:#0A0A0A;">${data.companyName}</strong>.
      We haven't seen a call booked yet -- wanted to make sure this didn't fall through the cracks.
    </p>
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">
      It's a 20-minute call. We'll walk through your specific use case, answer questions,
      and give you a realistic build timeline and cost estimate. No pitch, no pressure.
    </p>
  `;

  const html = buildBaseHtml({
    headline: `Still interested, ${data.contactName}?`,
    bodyHtml,
    ctaText: "Book a 20-minute call",
    ctaUrl: bookingUrl,
    includeUnsubscribe: true,
  });

  return send({
    to: data.contactEmail,
    subject: `Quick question about ${data.companyName}'s portal`,
    html,
    text: `Hi ${data.contactName},\n\nA few days ago you submitted portal details for ${data.companyName}. We haven't seen a call booked yet.\n\nBook a 20-minute call: ${bookingUrl}\n\n-- The ${BRAND_NAME} Team`,
  });
}

// ---------------------------------------------------------------------------
// Client: Intake nurture (Day 7 -- final follow-up)
// ---------------------------------------------------------------------------

export function sendIntakeNurtureDay7(data: {
  contactName: string;
  contactEmail: string;
  companyName: string;
}) {
  const calLink = process.env.NEXT_PUBLIC_CAL_LINK ?? "adamwolfe/wholesail";
  const bookingUrl = `https://app.cal.com/${calLink}`;

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">${data.contactName} -- I'll keep this short.</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">
      You submitted portal details for <strong style="color:#0A0A0A;">${data.companyName}</strong> about a week ago.
      I won't keep following up after this, but if timing wasn't right or questions came up, I'm happy to reconnect.
    </p>
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">
      Most of our clients have their portal live within 3-5 weeks of this call.
      If that's still on your radar, grab a time below.
    </p>
  `;

  const html = buildBaseHtml({
    headline: "Last note from us.",
    bodyHtml,
    ctaText: "Schedule the call",
    ctaUrl: bookingUrl,
    includeUnsubscribe: true,
  });

  return send({
    to: data.contactEmail,
    subject: `Last note on ${data.companyName}'s portal`,
    html,
    text: `${data.contactName} -- I'll keep this short.\n\nYou submitted portal details for ${data.companyName} about a week ago. Most of our clients have their portal live within 3-5 weeks.\n\nSchedule the call: ${bookingUrl}\n\n-- The ${BRAND_NAME} Team`,
  });
}

// ---------------------------------------------------------------------------
// Admin: Cal.com call booked
// ---------------------------------------------------------------------------

export function notifyAdminCallBooked(data: {
  companyName: string;
  contactName: string;
  contactEmail: string;
  intakeId: string;
}) {
  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">A consultation call has been booked.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F7F4;border:1px solid #E5E1DB;margin-bottom:24px;">
      <tr><td style="padding:12px 16px;font-size:13px;color:#C8C0B4;border-bottom:1px solid #E5E1DB;width:120px;">Company</td><td style="padding:12px 16px;font-size:14px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;font-weight:600;">${data.companyName}</td></tr>
      <tr><td style="padding:12px 16px;font-size:13px;color:#C8C0B4;">Contact</td><td style="padding:12px 16px;font-size:14px;color:#0A0A0A;">${data.contactName} (${data.contactEmail})</td></tr>
    </table>
  `;

  const html = buildBaseHtml({
    headline: "Consultation Call Booked",
    bodyHtml,
    ctaText: "View Intake in Admin",
    ctaUrl: `${APP_URL}/admin/intakes/${data.intakeId}`,
  });

  return send({
    to: ADMIN_EMAIL,
    subject: `Call booked: ${data.companyName}`,
    html,
    text: `Consultation call booked for ${data.companyName}.\nContact: ${data.contactName} (${data.contactEmail})\n\nView intake: ${APP_URL}/admin/intakes/${data.intakeId}`,
  });
}

// ---------------------------------------------------------------------------
// Client: Status change notification
// ---------------------------------------------------------------------------

export function notifyClientStatusChange(data: {
  contactName: string;
  contactEmail: string;
  companyName: string;
  newStatus: string;
  currentPhase: number;
  message?: string;
}) {
  const statusLabels: Record<string, string> = {
    ONBOARDING: "Onboarding",
    BUILDING: "Building",
    REVIEW: "In Review",
    LIVE: "Live",
  };

  const label = statusLabels[data.newStatus] || data.newStatus;

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.contactName},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">
      Your portal build for <strong style="color:#0A0A0A;">${data.companyName}</strong>
      has moved to <strong style="color:#0A0A0A;">${label}</strong> (Phase ${data.currentPhase}/15).
    </p>
    ${data.message ? `<p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">${data.message}</p>` : ""}
  `;

  const html = buildBaseHtml({
    headline: "Build Update",
    bodyHtml,
    ctaText: "Check Your Build Progress",
    ctaUrl: `${APP_URL}/status`,
  });

  return send({
    to: data.contactEmail,
    subject: `${data.companyName} portal update: ${label}`,
    html,
    text: `Hi ${data.contactName},\n\nYour portal build for ${data.companyName} has moved to ${label} (Phase ${data.currentPhase}/15).${data.message ? `\n\n${data.message}` : ""}\n\nCheck progress: ${APP_URL}/status\n\n-- The ${BRAND_NAME} Team`,
  });
}

// ---------------------------------------------------------------------------
// Client: Stripe Connect onboarding
// ---------------------------------------------------------------------------

export function sendStripeOnboardingEmail(params: {
  contactName: string;
  contactEmail: string;
  companyName: string;
  onboardingUrl: string;
}) {
  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${params.contactName},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">
      Great news -- we've started building your custom wholesale ordering portal for <strong style="color:#0A0A0A;">${params.companyName}</strong>.
    </p>
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">
      To accept payments through your portal, please complete your Stripe account setup.
      This takes about 5 minutes and connects your bank account so you can receive payouts directly.
    </p>
    <p style="margin:0;font-size:13px;color:#C8C0B4;font-style:italic;">This link expires in 24 hours. If it expires, contact us and we'll send a new one.</p>
  `;

  const html = buildBaseHtml({
    headline: "Complete Your Payment Setup",
    bodyHtml,
    ctaText: "Complete Stripe Setup",
    ctaUrl: params.onboardingUrl,
  });

  return send({
    to: params.contactEmail,
    subject: `${params.companyName} -- complete your payment setup`,
    html,
    text: `Hi ${params.contactName},\n\nGreat news -- we've started building your portal for ${params.companyName}.\n\nTo accept payments, complete your Stripe setup:\n${params.onboardingUrl}\n\nThis link expires in 24 hours.\n\n-- The ${BRAND_NAME} Team`,
  });
}

// ---------------------------------------------------------------------------
// Client: Portal is live
// ---------------------------------------------------------------------------

export function notifyClientPortalLive(data: {
  contactName: string;
  contactEmail: string;
  companyName: string;
  portalUrl: string;
}) {
  const fullUrl = data.portalUrl.startsWith("http")
    ? data.portalUrl
    : `https://${data.portalUrl}`;

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">${data.contactName}, your custom wholesale ordering portal for <strong style="color:#0A0A0A;">${data.companyName}</strong> is now live.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F7F4;border:1px solid #E5E1DB;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Your Portal URL</p>
        <p style="margin:0;font-size:18px;font-family:Georgia,serif;font-weight:700;color:#0A0A0A;">
          <a href="${fullUrl}" style="color:#0A0A0A;text-decoration:underline;">${data.portalUrl}</a>
        </p>
      </td></tr>
    </table>
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">
      Your clients can now log in and place orders. Your admin panel is ready for you to manage operations. If you need anything, just reply to this email.
    </p>
  `;

  const html = buildBaseHtml({
    headline: "Your Portal is Live",
    bodyHtml,
    ctaText: "Open Your Portal",
    ctaUrl: fullUrl,
  });

  return send({
    to: data.contactEmail,
    subject: `${data.companyName} -- your portal is live!`,
    html,
    text: `${data.contactName}, your portal for ${data.companyName} is now live at ${data.portalUrl}.\n\nYour clients can now log in and place orders.\n\n-- The ${BRAND_NAME} Team`,
  });
}
