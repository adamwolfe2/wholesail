/**
 * Email templates for client portal project lifecycle.
 * Sent from the admin dashboard during each fulfillment phase.
 */
import { Resend } from "resend";
import { getSiteUrl } from "../get-site-url";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Wholesail <noreply@wholesailhub.com>";
const BRAND_NAME = process.env.BRAND_NAME || "Wholesail";
const BRAND_COLOR = process.env.BRAND_PRIMARY_COLOR || "#0A0A0A";
const APP_URL = getSiteUrl();

type ProjectEmailData = {
  company: string;
  contactName: string;
  contactEmail: string;
  vercelUrl?: string | null;
  customDomain?: string | null;
  goLiveTimeline?: string | null;
};

function wrap(headline: string, bodyHtml: string, ctaText?: string, ctaUrl?: string): string {
  const ctaBlock =
    ctaText && ctaUrl
      ? `<tr><td style="padding:8px 32px 32px;">
          <a href="${ctaUrl}" style="display:inline-block;background-color:${BRAND_COLOR};color:#FFFFFF;font-size:13px;font-weight:600;text-decoration:none;padding:14px 28px;letter-spacing:0.06em;text-transform:uppercase;">${ctaText}</a>
        </td></tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#F9F7F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F7F4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border:1px solid #E5E1DB;">
        <tr><td style="background-color:${BRAND_COLOR};padding:24px 32px;">
          <p style="margin:0;color:#FFFFFF;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;">${BRAND_NAME}</p>
        </td></tr>
        <tr><td style="padding:32px 32px 24px;">
          <h1 style="margin:0 0 20px;color:#0A0A0A;font-family:Georgia,serif;font-size:24px;font-weight:700;line-height:1.3;">${headline}</h1>
          ${bodyHtml}
        </td></tr>
        ${ctaBlock}
        <tr><td style="padding:20px 32px;border-top:1px solid #E5E1DB;background-color:#F9F7F4;">
          <p style="margin:0;color:#0A0A0A;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">${BRAND_NAME}</p>
          <p style="margin:4px 0 0;color:#C8C0B4;font-size:12px;">${APP_URL.replace(/^https?:\/\//, "")}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// 1. Portal Building
// ---------------------------------------------------------------------------

export async function sendPortalBuildingEmail(data: ProjectEmailData) {
  const resend = getResend();
  if (!resend) return { success: false, error: "Resend not configured" };

  const timeline = data.goLiveTimeline || "within 2 weeks";
  const html = wrap(
    "Your portal is being built",
    `<p style="margin:0 0 16px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.contactName},</p>
     <p style="margin:0 0 16px;font-size:15px;color:#3D3833;line-height:1.6;">Great news -- we've started building the <strong>${data.company}</strong> ordering portal. Our automated pipeline is provisioning your infrastructure right now.</p>
     <p style="margin:0 0 16px;font-size:15px;color:#3D3833;line-height:1.6;">Here's what's happening behind the scenes:</p>
     <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;color:#3D3833;line-height:1.8;">
       <li>Custom GitHub repository created from our template</li>
       <li>Vercel hosting environment provisioned</li>
       <li>Database and authentication configured</li>
       <li>Payment processing connected via Stripe</li>
     </ul>
     <p style="margin:0 0 16px;font-size:15px;color:#3D3833;line-height:1.6;">Estimated timeline: <strong>${timeline}</strong>. We'll reach out shortly to collect your branding assets and product catalog.</p>
     <p style="margin:0;font-size:15px;color:#3D3833;line-height:1.6;">We'll keep you updated at each milestone.</p>`,
    "Track Your Project",
    `${APP_URL}/client-status`
  );

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.contactEmail,
      subject: `Your ${data.company} portal is being built`,
      html,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ---------------------------------------------------------------------------
// 2. Asset Request
// ---------------------------------------------------------------------------

export async function sendAssetRequestEmail(data: ProjectEmailData) {
  const resend = getResend();
  if (!resend) return { success: false, error: "Resend not configured" };

  const html = wrap(
    "We need your assets",
    `<p style="margin:0 0 16px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.contactName},</p>
     <p style="margin:0 0 16px;font-size:15px;color:#3D3833;line-height:1.6;">Your <strong>${data.company}</strong> portal build is moving forward. To finalize the design and populate your catalog, we need the following:</p>
     <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border:1px solid #E5E1DB;">
       <tr style="background-color:#F9F7F4;">
         <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#0A0A0A;border-bottom:1px solid #E5E1DB;">Item</td>
         <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#0A0A0A;border-bottom:1px solid #E5E1DB;">Details</td>
       </tr>
       <tr>
         <td style="padding:10px 14px;font-size:13px;color:#3D3833;border-bottom:1px solid #E5E1DB;">Logo</td>
         <td style="padding:10px 14px;font-size:13px;color:#3D3833;border-bottom:1px solid #E5E1DB;">SVG or high-res PNG (transparent background preferred)</td>
       </tr>
       <tr>
         <td style="padding:10px 14px;font-size:13px;color:#3D3833;border-bottom:1px solid #E5E1DB;">Product Catalog</td>
         <td style="padding:10px 14px;font-size:13px;color:#3D3833;border-bottom:1px solid #E5E1DB;">CSV or spreadsheet with: name, description, price, unit, category, image URL</td>
       </tr>
       <tr>
         <td style="padding:10px 14px;font-size:13px;color:#3D3833;border-bottom:1px solid #E5E1DB;">Marketing Photos</td>
         <td style="padding:10px 14px;font-size:13px;color:#3D3833;border-bottom:1px solid #E5E1DB;">5-10 product/team/facility photos for the marketing site</td>
       </tr>
       <tr>
         <td style="padding:10px 14px;font-size:13px;color:#3D3833;">Brand Guidelines</td>
         <td style="padding:10px 14px;font-size:13px;color:#3D3833;">Primary/secondary colors, fonts, tagline (if available)</td>
       </tr>
     </table>
     <p style="margin:0 0 16px;font-size:15px;color:#3D3833;line-height:1.6;">You can reply to this email with attachments, or share a Google Drive / Dropbox link.</p>
     <p style="margin:0;font-size:15px;color:#3D3833;line-height:1.6;">The sooner we receive these, the faster we can get your portal live.</p>`
  );

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.contactEmail,
      subject: `Action needed: assets for your ${data.company} portal`,
      html,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ---------------------------------------------------------------------------
// 3. Ready for Review
// ---------------------------------------------------------------------------

export async function sendReadyForReviewEmail(data: ProjectEmailData) {
  const resend = getResend();
  if (!resend) return { success: false, error: "Resend not configured" };

  const portalUrl = data.customDomain
    ? `https://${data.customDomain}`
    : data.vercelUrl || APP_URL;

  const html = wrap(
    "Your portal is ready for review",
    `<p style="margin:0 0 16px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.contactName},</p>
     <p style="margin:0 0 16px;font-size:15px;color:#3D3833;line-height:1.6;">Your <strong>${data.company}</strong> ordering portal is ready for your review. We've completed the build and populated it with your products and branding.</p>
     <p style="margin:0 0 16px;font-size:15px;color:#3D3833;line-height:1.6;">Please take a few minutes to:</p>
     <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;color:#3D3833;line-height:1.8;">
       <li>Verify your logo, colors, and branding look correct</li>
       <li>Browse the product catalog and check prices</li>
       <li>Place a test order to experience the checkout flow</li>
       <li>Review the admin dashboard</li>
     </ul>
     <p style="margin:0 0 16px;font-size:15px;color:#3D3833;line-height:1.6;">If you find anything that needs adjusting, just reply to this email with your feedback.</p>`,
    "Review Your Portal",
    portalUrl
  );

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.contactEmail,
      subject: `Your ${data.company} portal is ready for review`,
      html,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ---------------------------------------------------------------------------
// 4. Portal Live
// ---------------------------------------------------------------------------

export async function sendPortalLiveEmail(data: ProjectEmailData) {
  const resend = getResend();
  if (!resend) return { success: false, error: "Resend not configured" };

  const portalUrl = data.customDomain
    ? `https://${data.customDomain}`
    : data.vercelUrl || APP_URL;

  const html = wrap(
    "Your portal is live!",
    `<p style="margin:0 0 16px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.contactName},</p>
     <p style="margin:0 0 16px;font-size:15px;color:#3D3833;line-height:1.6;">Congratulations -- your <strong>${data.company}</strong> ordering portal is now live and ready for your clients to use!</p>
     <p style="margin:0 0 16px;font-size:15px;color:#3D3833;line-height:1.6;"><strong>Your portal URL:</strong> <a href="${portalUrl}" style="color:${BRAND_COLOR};">${portalUrl}</a></p>
     <p style="margin:0 0 16px;font-size:15px;color:#3D3833;line-height:1.6;">Here's how to get started:</p>
     <ol style="margin:0 0 16px;padding-left:20px;font-size:14px;color:#3D3833;line-height:1.8;">
       <li><strong>Log in to your admin dashboard</strong> at ${portalUrl}/admin</li>
       <li><strong>Invite your first clients</strong> -- they'll receive a welcome email with login instructions</li>
       <li><strong>Share your portal link</strong> with your sales team and existing clients</li>
       <li><strong>Monitor orders</strong> from the admin dashboard as they come in</li>
     </ol>
     <p style="margin:0 0 16px;font-size:15px;color:#3D3833;line-height:1.6;">We're here to help if you need anything. Reply to this email or reach out anytime.</p>
     <p style="margin:0;font-size:15px;color:#3D3833;line-height:1.6;">Welcome aboard!</p>`,
    "Open Your Portal",
    portalUrl
  );

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.contactEmail,
      subject: `Your ${data.company} portal is live!`,
      html,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
