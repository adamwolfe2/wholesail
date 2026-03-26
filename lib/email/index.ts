// NOTE: Before sending marketing or transactional emails, check the org's
// notificationPrefs (stored as JSON on the Organization model) using the
// shouldSendEmail() helper below. This ensures we respect each client's
// communication preferences.
import { Resend } from "resend";
import { getSiteUrl } from "../get-site-url";
import { formatCurrency } from "@/lib/utils";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

function isValidEmail(email: string | undefined | null): email is string {
  return !!email && email.includes('@');
}

import { portalConfig } from "@/lib/portal-config";

const FROM_EMAIL = portalConfig.fromEmail;
const APP_URL = getSiteUrl();
const OPS_NAME = portalConfig.opsName;
const BRAND_NAME = portalConfig.brandNameServer;
const BRAND_LOCATION = portalConfig.brandLocation;
const BRAND_EMAIL = portalConfig.adminEmail;
const BRAND_COLOR = portalConfig.primaryColor;

// ---------------------------------------------------------------------------
// buildBaseHtml — private helper that wraps content in the Wholesail branded
// email shell. Used by every transactional email for consistent branding.
// ---------------------------------------------------------------------------

interface BaseHtmlOptions {
  headline: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  /** Optional amber banner shown above the header (e.g. payment reminders) */
  alertBannerHtml?: string;
  /** If true, includes a one-click unsubscribe link in the footer (CAN-SPAM). Use for marketing/nurture emails, not transactional. */
  includeUnsubscribe?: boolean;
}

function buildBaseHtml({
  headline,
  bodyHtml,
  ctaText,
  ctaUrl,
  alertBannerHtml,
  includeUnsubscribe,
}: BaseHtmlOptions): string {
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
<body style="margin:0;padding:0;background-color:#F9F7F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F7F4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border:1px solid #E5E1DB;">

        <!-- HEADER: dark bar with brand name -->
        <tr><td style="background-color:${BRAND_COLOR};padding:24px 32px;">
          <p style="margin:0;color:#FFFFFF;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;">${BRAND_NAME}</p>
        </td></tr>

        <!-- OPTIONAL ALERT BANNER -->
        ${alertBlock}

        <!-- CONTENT AREA -->
        <tr><td style="padding:32px 32px 24px;">
          <h1 style="margin:0 0 20px;color:#0A0A0A;font-family:Georgia,serif;font-size:24px;font-weight:700;line-height:1.3;">${headline}</h1>
          ${bodyHtml}
        </td></tr>

        <!-- CTA BUTTON -->
        ${ctaBlock}

        <!-- FOOTER -->
        <tr><td style="padding:20px 32px;border-top:1px solid #E5E1DB;background-color:#F9F7F4;">
          <p style="margin:0;color:#0A0A0A;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">${BRAND_NAME}</p>
          <p style="margin:4px 0 0;color:#C8C0B4;font-size:12px;">${APP_URL.replace(/^https?:\/\//, "")}${BRAND_LOCATION ? ` &nbsp;&middot;&nbsp; ${BRAND_LOCATION}` : ""}</p>
          ${includeUnsubscribe ? `<p style="margin:8px 0 0;"><a href="${APP_URL}/client-portal/settings" style="color:#C8C0B4;font-size:11px;text-decoration:underline;">Unsubscribe or manage email preferences</a></p>` : ""}
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

interface OrderEmailData {
  orderNumber: string;
  orderId?: string; // DB id — used for admin deep-link
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; unitPrice: number; total: number }[];
  subtotal: number;
  total: number;
}

// ---------------------------------------------------------------------------
// sendOrderConfirmation
// ---------------------------------------------------------------------------

export async function sendOrderConfirmation(data: OrderEmailData) {
  const orderUrl = `${APP_URL}/client-portal/orders/${data.orderNumber}`;

  // Build items table rows with alternating backgrounds
  const itemRowsHtml = data.items
    .map((item, i) => {
      const bg = i % 2 === 0 ? "#F9F7F4" : "#FFFFFF";
      return `<tr style="background-color:${bg};">
        <td style="padding:10px 12px;font-size:14px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;">${item.name}</td>
        <td style="padding:10px 12px;font-size:14px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 12px;font-size:14px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;text-align:right;">${formatCurrency(item.total)}</td>
      </tr>`;
    })
    .join("");

  const tax = data.total - data.subtotal;

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.customerName},</p>
    <p style="margin:0 0 24px;font-size:15px;color:#3D3833;line-height:1.6;">Your order <strong style="color:#0A0A0A;">${data.orderNumber}</strong> has been received and is being reviewed. We'll be in touch once it's confirmed and ready to ship.</p>

    <!-- Items table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #E5E1DB;margin-bottom:20px;">
      <thead>
        <tr style="background-color:#0A0A0A;">
          <th style="padding:10px 12px;text-align:left;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#FFFFFF;font-weight:600;">Product</th>
          <th style="padding:10px 12px;text-align:center;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#FFFFFF;font-weight:600;">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#FFFFFF;font-weight:600;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRowsHtml}
      </tbody>
    </table>

    <!-- Totals -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#C8C0B4;">Subtotal</td>
        <td style="padding:6px 0;font-size:14px;color:#0A0A0A;text-align:right;">${formatCurrency(data.subtotal)}</td>
      </tr>
      ${tax > 0 ? `<tr>
        <td style="padding:6px 0;font-size:14px;color:#C8C0B4;">Tax</td>
        <td style="padding:6px 0;font-size:14px;color:#0A0A0A;text-align:right;">${formatCurrency(tax)}</td>
      </tr>` : ""}
      <tr style="border-top:2px solid #0A0A0A;">
        <td style="padding:10px 0 4px;font-size:15px;font-weight:700;color:#0A0A0A;">Total</td>
        <td style="padding:10px 0 4px;font-size:15px;font-weight:700;color:#0A0A0A;text-align:right;">${formatCurrency(data.total)}</td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#C8C0B4;font-style:italic;">Have questions? Reply to this email or message us through your portal.</p>
  `;

  const html = buildBaseHtml({
    headline: "Order Confirmed",
    bodyHtml,
    ctaText: "View Order Status →",
    ctaUrl: orderUrl,
  });

  // Plain-text fallback
  const itemRowsText = data.items
    .map((item) => `  ${item.name} × ${item.quantity} — ${formatCurrency(item.total)}`)
    .join("\n");

  const text = `Hi ${data.customerName},

Your order ${data.orderNumber} has been received and is being reviewed.

ITEMS:
${itemRowsText}

Subtotal: ${formatCurrency(data.subtotal)}
Total: ${formatCurrency(data.total)}

View your order: ${orderUrl}

Have questions? Reply to this email.

— ${BRAND_NAME}`;

  try {
    const r = getResend();
    if (!r) return { success: false, error: "Email not configured" };
    if (!isValidEmail(data.customerEmail)) return { success: false, error: "Invalid email address" };
    await r.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order Confirmed — ${data.orderNumber}`,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// sendOrderShippedEmail
// ---------------------------------------------------------------------------

export async function sendOrderShippedEmail(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
}) {
  const orderUrl = `${APP_URL}/client-portal/orders/${data.orderNumber}`;

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.customerName},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Your order <strong style="color:#0A0A0A;">${data.orderNumber}</strong> has left our facility and is on its way to you.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F7F4;border:1px solid #E5E1DB;margin-bottom:28px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Expected Delivery</p>
          <p style="margin:0;font-size:15px;color:#0A0A0A;font-weight:600;">Within 24–48 hours</p>
          <p style="margin:6px 0 0;font-size:13px;color:#C8C0B4;">SoCal deliveries may arrive same day. All shipments travel cold chain.</p>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:13px;color:#C8C0B4;font-style:italic;">Questions about your delivery? Reply to this email or check your portal for updates.</p>
  `;

  const html = buildBaseHtml({
    headline: "Your Order Shipped",
    bodyHtml,
    ctaText: "Track Your Order →",
    ctaUrl: orderUrl,
  });

  const text = `Hi ${data.customerName},

Your order ${data.orderNumber} has left our facility and is on its way to you.

Expected delivery: within 24–48 hours.

Track your order: ${orderUrl}

— ${BRAND_NAME}`;

  try {
    const r = getResend();
    if (!r) return { success: false, error: "Email not configured" };
    if (!isValidEmail(data.customerEmail)) return { success: false, error: "Invalid email address" };
    await r.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Your order ${data.orderNumber} is on its way`,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send shipped email:", error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// sendOrderDeliveredEmail
// ---------------------------------------------------------------------------

export async function sendOrderDeliveredEmail(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
}) {
  const catalogUrl = `${APP_URL}/catalog`;

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.customerName},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Order <strong style="color:#0A0A0A;">${data.orderNumber}</strong> has been delivered. We hope everything arrived in perfect condition — as it should.</p>
    <p style="margin:0 0 28px;font-size:15px;color:#3D3833;line-height:1.6;">Every product we ship meets the same exacting standard we'd hold for our own kitchen. If anything is less than perfect, let us know immediately and we'll make it right.</p>
    <p style="margin:0;font-size:13px;color:#C8C0B4;font-style:italic;">P.S. Leave feedback or message us anytime through your portal — we read every message.</p>
  `;

  const html = buildBaseHtml({
    headline: "Delivered — Enjoy!",
    bodyHtml,
    ctaText: "Place Your Next Order →",
    ctaUrl: catalogUrl,
  });

  const text = `Hi ${data.customerName},

Order ${data.orderNumber} has been delivered. We hope everything arrived in perfect condition.

Every product we ship meets the same exacting standard we'd hold for our own kitchen. If anything is less than perfect, let us know immediately and we'll make it right.

Place your next order: ${catalogUrl}

P.S. Leave feedback or message us anytime through your portal.

— ${BRAND_NAME}`;

  try {
    const r = getResend();
    if (!r) return { success: false, error: "Email not configured" };
    if (!isValidEmail(data.customerEmail)) return { success: false, error: "Invalid email address" };
    await r.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order ${data.orderNumber} delivered`,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send delivered email:", error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// sendInvoiceEmail
// isReminder: when true, shows an amber "past due" banner at the top
// ---------------------------------------------------------------------------

export async function sendInvoiceEmail(data: {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  dueDate: string;
  isReminder?: boolean;
}) {
  const invoicesUrl = `${APP_URL}/client-portal/invoices`;

  const alertBannerHtml = data.isReminder
    ? `<p style="margin:0;font-size:13px;font-weight:600;color:#92400E;">Payment Reminder &mdash; This invoice is past due. Please arrange payment at your earliest convenience.</p>`
    : undefined;

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.customerName},</p>
    <p style="margin:0 0 24px;font-size:15px;color:#3D3833;line-height:1.6;">${data.isReminder ? "A friendly reminder that the following invoice is outstanding." : "A new invoice has been generated for your account."}</p>

    <!-- Invoice summary card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F7F4;border:1px solid #E5E1DB;margin-bottom:28px;">
      <tr>
        <td style="padding:24px 24px 20px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Invoice Number</p>
          <p style="margin:0 0 20px;font-size:20px;font-family:'Courier New',Courier,monospace;font-weight:700;color:#0A0A0A;letter-spacing:0.05em;">${data.invoiceNumber}</p>

          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Amount Due</p>
          <p style="margin:0 0 20px;font-size:32px;font-family:Georgia,serif;font-weight:700;color:#0A0A0A;line-height:1;">${formatCurrency(data.total)}</p>

          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Due Date</p>
          <p style="margin:0;font-size:16px;font-weight:600;color:${data.isReminder ? "#DC2626" : "#0A0A0A"};">${data.dueDate}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#C8C0B4;font-style:italic;">Questions about this invoice? Reply here or message us in your portal.</p>
  `;

  const html = buildBaseHtml({
    headline: "Invoice Ready",
    bodyHtml,
    ctaText: "Pay Online →",
    ctaUrl: invoicesUrl,
    alertBannerHtml,
  });

  const reminderPrefix = data.isReminder ? "[REMINDER] " : "";
  const text = `Hi ${data.customerName},

${data.isReminder ? "A friendly reminder that the following invoice is outstanding." : "A new invoice has been generated for your account."}

Invoice: ${data.invoiceNumber}
Amount: ${formatCurrency(data.total)}
Due Date: ${data.dueDate}

View and pay your invoice: ${invoicesUrl}

Questions? Reply here or message us in your portal.

— ${BRAND_NAME}`;

  try {
    const r = getResend();
    if (!r) return { success: false, error: "Email not configured" };
    if (!isValidEmail(data.customerEmail)) return { success: false, error: "Invalid email address" };
    await r.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `${reminderPrefix}Invoice ${data.invoiceNumber} — ${formatCurrency(data.total)}`,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send invoice email:", error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// sendWelcomePartnerEmail
// ---------------------------------------------------------------------------

export async function sendWelcomePartnerEmail(data: {
  name: string;
  email: string;
  businessName: string;
  portalUrl?: string;
}) {
  const portalUrl = data.portalUrl ?? `${APP_URL}/client-portal/dashboard`;
  const catalogUrl = `${APP_URL}/catalog`;

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">
      <strong style="color:#0A0A0A;">${data.businessName}</strong> now has wholesale access to the platform catalog. Welcome, ${data.name}.
    </p>

    <!-- Your Account -->
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Your Account</p>
    <p style="margin:0 0 8px;font-size:14px;color:#3D3833;line-height:1.6;">Log in with the email address you applied with:</p>
    <p style="margin:0 0 24px;"><a href="${portalUrl}" style="color:#0A0A0A;font-size:14px;text-decoration:underline;">${portalUrl}</a></p>

    <div style="height:1px;background-color:#E5E1DB;margin:0 0 24px;"></div>

    <!-- How to Order -->
    <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">How to Order</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="padding:0 0 10px;">
        <p style="margin:0;font-size:14px;color:#3D3833;line-height:1.6;"><strong style="color:#0A0A0A;">Browse 122+ SKUs</strong> at <a href="${catalogUrl}" style="color:#0A0A0A;">/catalog</a> — wholesale products.</p>
      </td></tr>
      <tr><td style="padding:0 0 10px;">
        <p style="margin:0;font-size:14px;color:#3D3833;line-height:1.6;"><strong style="color:#0A0A0A;">AI Order Parser</strong> — type what you need in plain English: <em>"10 cases olive oil, 5 lbs sea salt"</em> and we'll match it to your cart in seconds.</p>
      </td></tr>
      <tr><td>
        <p style="margin:0;font-size:14px;color:#3D3833;line-height:1.6;"><strong style="color:#0A0A0A;">Standing orders</strong> — set up automatic reorders for your staples so you never run low.</p>
      </td></tr>
    </table>

    <div style="height:1px;background-color:#E5E1DB;margin:0 0 24px;"></div>

    <!-- Delivery -->
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Delivery</p>
    <p style="margin:0 0 24px;font-size:14px;color:#3D3833;line-height:1.6;">SoCal same-day if ordered before 11am. Nationwide 24&ndash;48hr cold chain. All orders ship with insulated packaging and ice packs.</p>

    <div style="height:1px;background-color:#E5E1DB;margin:0 0 24px;"></div>

    <!-- Your Rep -->
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Your Rep</p>
    <p style="margin:0 0 4px;font-size:14px;color:#3D3833;line-height:1.6;">Questions? Reply to this email or reach ${OPS_NAME} directly. We're here to make your first order &mdash; and every order after &mdash; as smooth as possible.</p>
  `;

  const html = buildBaseHtml({
    headline: "You're in.",
    bodyHtml,
    ctaText: "Browse the Catalog",
    ctaUrl: catalogUrl,
  });

  const text = `Hi ${data.name},

You're in. ${data.businessName} now has wholesale access to the platform catalog.

YOUR ACCOUNT
Log in with the email address you applied with:
${portalUrl}

HOW TO ORDER
• Browse 122+ SKUs at ${catalogUrl} — wholesale products
• AI Order Parser — just type what you need: "10 cases olive oil, 5 lbs sea salt" and we'll build your cart
• Standing orders — set up automatic reorders for your staples

DELIVERY
Fast, reliable delivery with cold chain support where required. All orders ship with proper packaging.

MINIMUMS
No order minimums on most items. Market-rate items are priced on request.

YOUR REP
Questions? Reply to this email or reach ${OPS_NAME} directly.

Browse the catalog: ${catalogUrl}

— The ${BRAND_NAME} Team`;

  try {
    const r = getResend();
    if (!r) return { success: false, error: "Email not configured" };
    if (!isValidEmail(data.email)) return { success: false, error: "Invalid email address" };
    await r.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Welcome to ${BRAND_NAME}, ${data.name} — here's everything you need to know`,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// sendWholesaleRejectionEmail
// ---------------------------------------------------------------------------

export async function sendWholesaleRejectionEmail(data: {
  contactName: string;
  businessName: string;
  email: string;
}) {
  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.contactName},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Thank you for your interest in partnering with ${BRAND_NAME}.</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">After careful review, we're unable to move forward with <strong style="color:#0A0A0A;">${data.businessName}</strong>'s wholesale application at this time. This decision may be due to our current capacity, geographic focus, or product alignment — it is not a reflection of your business.</p>
    <p style="margin:0 0 4px;font-size:15px;color:#3D3833;line-height:1.6;">You're welcome to reapply in 90 days, and we encourage you to reach out directly with any questions at <a href="mailto:${BRAND_EMAIL}" style="color:#0A0A0A;">${BRAND_EMAIL}</a>.</p>
  `;

  const html = buildBaseHtml({
    headline: "Thank You for Applying",
    bodyHtml,
  });

  const text = `Hi ${data.contactName},

Thank you for your interest in partnering with ${BRAND_NAME}.

After careful review, we're unable to move forward with ${data.businessName}'s wholesale application at this time. This decision may be due to our current capacity, geographic focus, or product alignment — it is not a reflection of your business.

You're welcome to reapply in 90 days, and we encourage you to reach out directly with any questions at ${BRAND_EMAIL}.

We appreciate your interest and hope to have the opportunity to work together in the future.

— The ${BRAND_NAME} Team`;

  try {
    const r = getResend();
    if (!r) return { success: false, error: "Email not configured" };
    if (!isValidEmail(data.email)) return { success: false, error: "Invalid email address" };
    await r.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Your ${BRAND_NAME} Application — ${data.businessName}`,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send wholesale rejection email:", error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// sendDropAlertEmail
// ---------------------------------------------------------------------------

export async function sendDropAlertEmail(data: {
  email: string;
  dropTitle: string;
  dropDate: string; // ISO string
  description: string | null;
  category: string | null;
}) {
  const formattedDate = new Date(data.dropDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">The drop you signed up for is now available.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F7F4;border:1px solid #E5E1DB;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 16px;font-size:20px;font-family:Georgia,serif;font-weight:700;color:#0A0A0A;line-height:1.3;">${data.dropTitle}</p>
        ${data.category ? `<p style="margin:0 0 8px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;">${data.category}</p>` : ""}
        <p style="margin:0 0 4px;font-size:13px;color:#C8C0B4;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Available</p>
        <p style="margin:0 ${data.description ? "0 16px" : ""};font-size:15px;font-weight:600;color:#0A0A0A;">${formattedDate}</p>
        ${data.description ? `<p style="margin:0;font-size:14px;color:#3D3833;line-height:1.6;">${data.description}</p>` : ""}
      </td></tr>
    </table>
  `;

  const html = buildBaseHtml({
    headline: "Your Drop Is Live",
    bodyHtml,
    ctaText: "Shop Now →",
    ctaUrl: APP_URL,
    includeUnsubscribe: true,
  });

  const categoryLine = data.category ? `Category: ${data.category}\n` : "";
  const descLine = data.description ? `\n${data.description}\n` : "";

  const text = `The drop you signed up for is now available!

${data.dropTitle}
${categoryLine}Available: ${formattedDate}${descLine}
Shop now: ${APP_URL}

— ${BRAND_NAME}`;

  try {
    const r = getResend();
    if (!r) return { success: false, error: "Email not configured" };
    if (!isValidEmail(data.email)) return { success: false, error: "Invalid email address" };
    await r.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Now Available: ${data.dropTitle}`,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send drop alert email:", error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// sendDropBlastEmail
// ---------------------------------------------------------------------------

export async function sendDropBlastEmail(data: {
  email: string;
  dropTitle: string;
  dropDate: string; // ISO string
  description: string | null;
  category: string | null;
  priceNote: string | null;
  imageUrl?: string | null;
}) {
  const formattedDate = new Date(data.dropDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const imageBlock =
    data.imageUrl
      ? `<tr><td style="padding:0 0 24px;">
          <img src="${data.imageUrl}" alt="${data.dropTitle}" width="536" style="width:100%;max-width:536px;height:auto;display:block;border:1px solid #E5E1DB;" />
        </td></tr>`
      : "";

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#C8C0B4;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;">New Drop</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:0;">
      ${imageBlock}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F7F4;border:1px solid #E5E1DB;margin-bottom:24px;">
      <tr><td style="padding:24px;">
        <h2 style="margin:0 0 12px;font-size:22px;font-family:Georgia,serif;font-weight:700;color:#0A0A0A;line-height:1.3;">${data.dropTitle}</h2>
        ${data.category ? `<p style="margin:0 0 12px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;">${data.category}</p>` : ""}
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:0 24px 0 0;width:50%;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Available</p>
              <p style="margin:0;font-size:14px;font-weight:600;color:#0A0A0A;">${formattedDate}</p>
            </td>
            ${data.priceNote ? `<td style="width:50%;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Pricing</p>
              <p style="margin:0;font-size:14px;font-weight:600;color:#0A0A0A;">${data.priceNote}</p>
            </td>` : ""}
          </tr>
        </table>
        ${data.description ? `<p style="margin:16px 0 0;font-size:14px;color:#3D3833;line-height:1.7;border-top:1px solid #E5E1DB;padding-top:16px;">${data.description}</p>` : ""}
      </td></tr>
    </table>
    <p style="margin:0;font-size:13px;color:#C8C0B4;font-style:italic;">First-come, first-served. Limited quantity available.</p>
  `;

  const html = buildBaseHtml({
    headline: data.dropTitle,
    bodyHtml,
    ctaText: "Order Now →",
    ctaUrl: `${APP_URL}/drops`,
    includeUnsubscribe: true,
  });

  const lines: string[] = [];
  if (data.category) lines.push(`Category: ${data.category}`);
  lines.push(`Available: ${formattedDate}`);
  if (data.priceNote) lines.push(`Pricing: ${data.priceNote}`);
  if (data.description) lines.push(`\n${data.description}`);

  const text = `New drop from ${BRAND_NAME}.

${data.dropTitle}
${lines.join("\n")}

First-come, first-served. Order now:
${APP_URL}/drops

— ${BRAND_NAME}`;

  try {
    const r = getResend();
    if (!r) return { success: false, error: "Email not configured" };
    if (!isValidEmail(data.email)) return { success: false, error: "Invalid email address" };
    await r.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `[DROP] ${data.dropTitle} — Limited Quantity Available`,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send drop blast email:", error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// sendAbandonedCartEmail
// ---------------------------------------------------------------------------

export async function sendAbandonedCartEmail(data: {
  email: string;
  name: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  cartTotal: number;
  checkoutUrl: string;
}) {
  const itemRowsHtml = data.items
    .map((item, i) => {
      const bg = i % 2 === 0 ? "#F9F7F4" : "#FFFFFF";
      const lineTotal = formatCurrency(item.unitPrice * item.quantity);
      return `<tr style="background-color:${bg};">
        <td style="padding:10px 12px;font-size:14px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;">${item.name}</td>
        <td style="padding:10px 12px;font-size:14px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 12px;font-size:14px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;text-align:right;">${lineTotal}</td>
      </tr>`;
    })
    .join("");

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.name},</p>
    <p style="margin:0 0 24px;font-size:15px;color:#3D3833;line-height:1.6;">You left some items in your cart. Ready to complete your order?</p>

    <!-- Cart items table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #E5E1DB;margin-bottom:16px;">
      <thead>
        <tr style="background-color:#0A0A0A;">
          <th style="padding:10px 12px;text-align:left;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#FFFFFF;font-weight:600;">Item</th>
          <th style="padding:10px 12px;text-align:center;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#FFFFFF;font-weight:600;">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#FFFFFF;font-weight:600;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRowsHtml}
      </tbody>
    </table>

    <!-- Cart total -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr style="border-top:2px solid #0A0A0A;">
        <td style="padding:10px 0 4px;font-size:15px;font-weight:700;color:#0A0A0A;">Cart Total</td>
        <td style="padding:10px 0 4px;font-size:15px;font-weight:700;color:#0A0A0A;text-align:right;">${formatCurrency(data.cartTotal)}</td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#C8C0B4;font-style:italic;">Items in your cart are subject to availability. Reply to this email if you have any questions about pricing, delivery, or your order.</p>
  `;

  const html = buildBaseHtml({
    headline: "Your cart is waiting",
    bodyHtml,
    ctaText: "Complete Your Order →",
    ctaUrl: data.checkoutUrl,
    includeUnsubscribe: true,
  });

  const itemLines = data.items
    .map((i) => `  • ${i.name} × ${i.quantity} — ${formatCurrency((i.unitPrice * i.quantity))}`)
    .join("\n");

  const text = `Hi ${data.name},

You left some items in your cart — just wanted to make sure they don't slip away!

Your cart:
${itemLines}

Cart total: ${formatCurrency(data.cartTotal)}

Ready to finish your order?
${data.checkoutUrl}

Items in your cart are subject to availability. Whenever you're ready, we're here.

— ${BRAND_NAME}
P.S. Reply to this email if you have any questions about pricing, delivery, or your order.`;

  try {
    const r = getResend();
    if (!r) return { success: false, error: "Email not configured" };
    if (!isValidEmail(data.email)) return { success: false, error: "Invalid email address" };
    await r.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `just gonna "wanna bump" this to the top of your inbox`,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send abandoned cart email:", error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// sendPartnerDay3Email
// ---------------------------------------------------------------------------

export async function sendPartnerDay3Email(data: {
  name: string;
  email: string;
  businessName: string;
}) {
  const catalogUrl = `${APP_URL}/catalog`;

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.name},</p>
    <p style="margin:0 0 24px;font-size:15px;color:#3D3833;line-height:1.6;">Welcome aboard — we're glad to have <strong style="color:#0A0A0A;">${data.businessName}</strong> as a partner. A few things worth knowing before you place your first order:</p>

    <!-- Minimums -->
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Order Minimums</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #E5E1DB;margin-bottom:24px;">
      <tr style="background-color:#F9F7F4;"><td style="padding:10px 14px;font-size:14px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;">Standard Items</td><td style="padding:10px 14px;font-size:13px;color:#C8C0B4;border-bottom:1px solid #E5E1DB;text-align:right;">No minimum</td></tr>
      <tr><td style="padding:10px 14px;font-size:14px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;">Market-Rate Items</td><td style="padding:10px 14px;font-size:13px;color:#C8C0B4;border-bottom:1px solid #E5E1DB;text-align:right;">Priced on request</td></tr>
      <tr style="background-color:#F9F7F4;"><td style="padding:10px 14px;font-size:14px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;">Bulk Orders</td><td style="padding:10px 14px;font-size:13px;color:#C8C0B4;border-bottom:1px solid #E5E1DB;text-align:right;">Minimums noted per item</td></tr>
      <tr><td style="padding:10px 14px;font-size:14px;color:#0A0A0A;">Custom Orders</td><td style="padding:10px 14px;font-size:13px;color:#C8C0B4;text-align:right;">Contact your rep</td></tr>
    </table>

    <!-- Cold chain -->
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Cold Chain Delivery</p>
    <p style="margin:0 0 24px;font-size:14px;color:#3D3833;line-height:1.6;">All temperature-sensitive items ship with gel packs in insulated packaging. We deliver Tuesday–Friday. Need weekend delivery? Contact us directly and we'll do our best.</p>

    <!-- AI Parser -->
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">AI Order Parser (the fast way)</p>
    <p style="margin:0 0 4px;font-size:14px;color:#3D3833;line-height:1.6;">Paste a plain-text list — <em>"10 cases olive oil, 5 lbs sea salt"</em> — and our parser will turn it into a cart in seconds. Try it from your dashboard.</p>
  `;

  const html = buildBaseHtml({
    headline: "Before Your First Order",
    bodyHtml,
    ctaText: "Browse the Catalog →",
    ctaUrl: catalogUrl,
    includeUnsubscribe: true,
  });

  const text = `Hi ${data.name},

Welcome aboard — we're glad to have ${data.businessName} as a partner.

A few things worth knowing before you place your first order:

Order minimums:
• Standard items — no minimum
• Market-rate items — priced on request
• Bulk orders — minimums noted per item
• Custom orders — contact your rep

Delivery:
All temperature-sensitive items ship with proper cold chain packaging. Contact us if you need expedited or weekend delivery.

AI Order Parser (the fast way to order):
You can paste a plain-text list — like "10 cases olive oil, 5 lbs sea salt" — and our parser will turn it into a cart in seconds. Try it from your dashboard.

Browse the full catalog here:
${catalogUrl}

Questions? Reply to this email or reach us at ${BRAND_EMAIL}.

— The ${BRAND_NAME} Team`;

  try {
    const r = getResend();
    if (!r) return { success: false, error: "Email not configured" };
    if (!isValidEmail(data.email)) return { success: false, error: "Invalid email address" };
    await r.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Your first ${BRAND_NAME} order — here's what to know`,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send partner day-3 email:", error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// sendPartnerDay7Email
// ---------------------------------------------------------------------------

export async function sendPartnerDay7Email(data: {
  name: string;
  email: string;
  businessName: string;
}) {
  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.name},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Most of our partners place their first order within the first week — just wanted to check in and see if <strong style="color:#0A0A0A;">${data.businessName}</strong> is ready to go.</p>
    <p style="margin:0 0 4px;font-size:15px;color:#3D3833;line-height:1.6;">Reorder in seconds using our AI Order Parser — just paste your list and we'll build the cart for you.</p>
  `;

  const html = buildBaseHtml({
    headline: "What are you running low on?",
    bodyHtml,
    ctaText: "Place Your First Order →",
    ctaUrl: APP_URL,
    includeUnsubscribe: true,
  });

  const text = `Hi ${data.name},

Most of our partners place their first order within the first week — just wanted to check in and see if ${data.businessName} is ready to go.

Reorder in seconds using our AI Order Parser — just paste your list and we'll build the cart for you.

Place your first order:
${APP_URL}

As always, reply here if you have questions about availability, pricing, or delivery.

— The ${BRAND_NAME} Team`;

  try {
    const r = getResend();
    if (!r) return { success: false, error: "Email not configured" };
    if (!isValidEmail(data.email)) return { success: false, error: "Invalid email address" };
    await r.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `What are you running low on?`,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send partner day-7 email:", error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// sendLowStockAlert — internal ops email
// ---------------------------------------------------------------------------

export async function sendLowStockAlert(
  items: {
    name: string;
    category: string;
    quantityOnHand: number;
    lowStockThreshold: number;
  }[]
) {
  const r = getResend();
  if (!r) return null;
  const from = portalConfig.fromEmail;
  const to = process.env.OPS_NOTIFICATION_EMAIL || from;

  const itemRowsHtml = items
    .map(
      (i, idx) => {
        const bg = idx % 2 === 0 ? "#1A1A1A" : "#111111";
        const stockColor = i.quantityOnHand === 0 ? "#EF4444" : "#F59E0B";
        return `<tr style="background-color:${bg};">
          <td style="padding:10px 14px;font-size:14px;color:#F9F7F4;border-bottom:1px solid #2A2A2A;">${i.name}</td>
          <td style="padding:10px 14px;font-size:13px;color:#C8C0B4;border-bottom:1px solid #2A2A2A;">${i.category}</td>
          <td style="padding:10px 14px;font-size:14px;color:${stockColor};font-weight:700;border-bottom:1px solid #2A2A2A;text-align:right;">${i.quantityOnHand}</td>
          <td style="padding:10px 14px;font-size:14px;color:#C8C0B4;border-bottom:1px solid #2A2A2A;text-align:right;">${i.lowStockThreshold}</td>
        </tr>`;
      }
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A0A;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#111111;border:1px solid #2A2A2A;">

        <!-- HEADER -->
        <tr><td style="background-color:#0A0A0A;padding:20px 28px;border-bottom:1px solid #2A2A2A;">
          <p style="margin:0;color:#F9F7F4;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;">${BRAND_NAME} Ops &nbsp;&middot;&nbsp; Internal Alert</p>
        </td></tr>

        <!-- CONTENT -->
        <tr><td style="padding:28px 28px 20px;">
          <h1 style="margin:0 0 6px;color:#F9F7F4;font-family:Georgia,serif;font-size:22px;font-weight:700;">Low Stock Alert</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#C8C0B4;">${items.length} product${items.length !== 1 ? "s are" : " is"} at or below the restock threshold.</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #2A2A2A;">
            <thead>
              <tr style="background-color:#0A0A0A;">
                <th style="padding:10px 14px;text-align:left;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Product</th>
                <th style="padding:10px 14px;text-align:left;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Category</th>
                <th style="padding:10px 14px;text-align:right;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">On Hand</th>
                <th style="padding:10px 14px;text-align:right;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Threshold</th>
              </tr>
            </thead>
            <tbody>${itemRowsHtml}</tbody>
          </table>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="padding:16px 28px;border-top:1px solid #2A2A2A;">
          <p style="margin:0;color:#C8C0B4;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;">${BRAND_NAME} Ops &nbsp;&middot;&nbsp; ${APP_URL.replace(/^https?:\/\//, "")}</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const textRows = items
    .map((i) => `  ${i.name} (${i.category}) — On Hand: ${i.quantityOnHand} / Threshold: ${i.lowStockThreshold}`)
    .join("\n");

  return r.emails.send({
    from,
    to,
    subject: `Low Stock Alert — ${items.length} item${items.length !== 1 ? "s" : ""} need restocking`,
    html,
    text: `Low Stock Alert\n\n${items.length} product${items.length !== 1 ? "s are" : " is"} at or below the restock threshold:\n\n${textRows}\n\n— ${BRAND_NAME} Ops`,
  });
}

// ---------------------------------------------------------------------------
// sendInternalOrderNotification
// ---------------------------------------------------------------------------

export async function sendInternalOrderNotification(data: OrderEmailData) {
  const OPS_EMAIL = process.env.OPS_NOTIFICATION_EMAIL || FROM_EMAIL;
  const adminUrl = `${APP_URL}/admin/orders${data.orderId ? `/${data.orderId}` : ""}`;

  const itemRowsHtml = data.items
    .map((item, i) => {
      const bg = i % 2 === 0 ? "#F9F7F4" : "#FFFFFF";
      return `<tr style="background-color:${bg};">
        <td style="padding:8px 12px;font-size:13px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;">${item.name}</td>
        <td style="padding:8px 12px;font-size:13px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;font-size:13px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;text-align:right;">${formatCurrency(item.total)}</td>
      </tr>`;
    })
    .join("");

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">A new order has been placed and is waiting for review.</p>

    <!-- Order meta -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F7F4;border:1px solid #E5E1DB;margin-bottom:20px;">
      <tr><td style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:50%;padding:0 16px 0 0;">
              <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#C8C0B4;font-weight:600;">Order</p>
              <p style="margin:0;font-size:15px;font-weight:700;color:#0A0A0A;">${data.orderNumber}</p>
            </td>
            <td style="width:50%;">
              <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#C8C0B4;font-weight:600;">Customer</p>
              <p style="margin:0;font-size:15px;font-weight:700;color:#0A0A0A;">${data.customerName}</p>
              <p style="margin:2px 0 0;font-size:12px;color:#C8C0B4;">${data.customerEmail}</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- Items -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #E5E1DB;margin-bottom:16px;">
      <thead>
        <tr style="background-color:#0A0A0A;">
          <th style="padding:8px 12px;text-align:left;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#FFFFFF;font-weight:600;">Product</th>
          <th style="padding:8px 12px;text-align:center;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#FFFFFF;font-weight:600;">Qty</th>
          <th style="padding:8px 12px;text-align:right;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#FFFFFF;font-weight:600;">Total</th>
        </tr>
      </thead>
      <tbody>${itemRowsHtml}</tbody>
    </table>

    <!-- Order total -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px;">
      <tr>
        <td style="padding:8px 0;font-size:15px;font-weight:700;color:#0A0A0A;">Order Total</td>
        <td style="padding:8px 0;font-size:15px;font-weight:700;color:#0A0A0A;text-align:right;">${formatCurrency(data.total)}</td>
      </tr>
    </table>
  `;

  const html = buildBaseHtml({
    headline: `New Order: ${data.orderNumber}`,
    bodyHtml,
    ctaText: "Review in Admin →",
    ctaUrl: adminUrl,
  });

  const text = `New order received!

Order: ${data.orderNumber}
Customer: ${data.customerName} (${data.customerEmail})
Total: ${formatCurrency(data.total)}
Items: ${data.items.length}

View in admin: ${adminUrl}`;

  try {
    const r = getResend();
    if (!r) return { success: false, error: "Email not configured" };
    await r.emails.send({
      from: FROM_EMAIL,
      to: OPS_EMAIL,
      subject: `New Order: ${data.orderNumber} — ${formatCurrency(data.total)}`,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send internal notification:", error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// sendTierUpgradeEmail
// ---------------------------------------------------------------------------

export async function sendTierUpgradeEmail(data: {
  name: string;
  email: string;
  businessName: string;
  newTier: "REPEAT" | "VIP";
  totalSpend: number;
}) {
  const r = getResend();
  if (!r) return null;
  if (!isValidEmail(data.email)) return null;

  const isVIP = data.newTier === "VIP";

  const subject = isVIP
    ? `${data.businessName} is now a ${BRAND_NAME} VIP Partner`
    : `${data.businessName} has unlocked Repeat Partner status`;

  const tierLabel = isVIP ? "VIP Partner" : "Repeat Partner";
  const catalogUrl = `${APP_URL}/catalog`;

  const perks = isVIP
    ? [
        "Priority inventory access on new drops",
        "Dedicated account management",
        "White-glove cold chain delivery",
        "Exclusive VIP pricing on select SKUs",
      ]
    : [
        "Access to Repeat Partner pricing",
        "Early notification on seasonal drops",
        "Extended net terms available on request",
      ];

  const perkRowsHtml = perks
    .map(
      (p) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #E5E1DB;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="padding:0 10px 0 0;color:#0A0A0A;font-size:16px;vertical-align:top;">&bull;</td>
            <td style="font-size:14px;color:#0A0A0A;line-height:1.5;">${p}</td>
          </tr></table>
        </td></tr>`
    )
    .join("");

  const spendDesc = isVIP
    ? `<strong style="color:#0A0A0A;">${data.businessName}</strong> has crossed $${Math.round(data.totalSpend / 1000)}K in total orders with us — making you a <strong style="color:#0A0A0A;">VIP Partner</strong>. That's a big deal to us.`
    : `<strong style="color:#0A0A0A;">${data.businessName}</strong> has crossed $5,000 in total orders with us — unlocking <strong style="color:#0A0A0A;">Repeat Partner</strong> status.`;

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hey ${data.name},</p>
    <p style="margin:0 0 24px;font-size:15px;color:#3D3833;line-height:1.6;">${spendDesc}</p>

    <!-- Perks card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F7F4;border:1px solid #E5E1DB;margin-bottom:28px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 14px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">${isVIP ? "VIP Perks" : "What's Unlocked"}</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${perkRowsHtml}
        </table>
      </td></tr>
    </table>

    <p style="margin:0;font-size:13px;color:#C8C0B4;font-style:italic;">Welcome to ${tierLabel}. We're glad to have you in this tier.</p>
  `;

  const html = buildBaseHtml({
    headline: isVIP ? "Welcome to VIP." : "You've Been Upgraded.",
    bodyHtml,
    ctaText: "Browse Catalog →",
    ctaUrl: catalogUrl,
    includeUnsubscribe: true,
  });

  const perkLines = perks.map((p) => `  • ${p}`).join("\n");

  const text = `Hey ${data.name},

${isVIP
  ? `${data.businessName} has crossed $${Math.round(data.totalSpend / 1000)}K in total orders with us — making you a VIP Partner. That's a big deal to us.`
  : `${data.businessName} has crossed $5,000 in total orders with us — unlocking Repeat Partner status.`}

${isVIP ? "VIP PERKS" : "WHAT'S UNLOCKED"}:
${perkLines}

Welcome to ${tierLabel}.

Browse the catalog: ${catalogUrl}

— The ${BRAND_NAME} Team`;

  return r.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject,
    html,
    text,
  });
}

// ---------------------------------------------------------------------------
// sendApplicationStatusEmail
// ---------------------------------------------------------------------------

export async function sendApplicationStatusEmail(data: {
  contactName: string;
  businessName: string;
  email: string;
  status: "APPROVED" | "WAITLISTED" | "REJECTED";
  portalUrl?: string;
}) {
  const portalUrl = data.portalUrl ?? `${APP_URL}/sign-up`;

  let subject: string;
  let headline: string;
  let bodyHtml: string;
  let text: string;

  if (data.status === "APPROVED") {
    subject = `Your ${BRAND_NAME} wholesale application has been approved!`;
    headline = "You're Approved!";
    bodyHtml = `
      <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.contactName},</p>
      <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Great news — <strong style="color:#0A0A0A;">${data.businessName}</strong>'s wholesale application has been approved!</p>
      <p style="margin:0 0 24px;font-size:15px;color:#3D3833;line-height:1.6;">Your portal invitation is on its way in a separate email. Use it to set up your account and start ordering the platform catalog.</p>
      <p style="margin:0 0 4px;font-size:13px;color:#C8C0B4;font-style:italic;">Questions? Reply to this email and we'll get back to you the same day.</p>
    `;
    text = `Hi ${data.contactName},

Great news — ${data.businessName}'s wholesale application has been approved!

Your portal invitation link is on its way in a separate email from Clerk. Use it to set up your account and start ordering.

Once you're signed in, you'll have access to the full product catalog.

Get started here: ${portalUrl}

Questions? Reply to this email and we'll get back to you the same day.

— The ${BRAND_NAME} Team`;
  } else if (data.status === "WAITLISTED") {
    subject = `You've been added to the ${BRAND_NAME} waitlist — ${data.businessName}`;
    headline = "You're on the Waitlist";
    bodyHtml = `
      <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.contactName},</p>
      <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Thank you for applying to partner with ${BRAND_NAME}.</p>
      <p style="margin:0 0 4px;font-size:15px;color:#3D3833;line-height:1.6;">We've reviewed <strong style="color:#0A0A0A;">${data.businessName}</strong>'s application and have added you to our waitlist. We're selectively expanding our partner network and will reach out as soon as space opens up.</p>
    `;
    text = `Hi ${data.contactName},

Thank you for applying to partner with ${BRAND_NAME}.

We've reviewed ${data.businessName}'s application and have added you to our waitlist. We're selectively expanding our partner network and will reach out as soon as space opens up.

We appreciate your interest and look forward to the opportunity to work together.

— The ${BRAND_NAME} Team`;
  } else {
    subject = `Your ${BRAND_NAME} wholesale application — ${data.businessName}`;
    headline = "Thank You for Applying";
    bodyHtml = `
      <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.contactName},</p>
      <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Thank you for your interest in partnering with ${BRAND_NAME}.</p>
      <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">After careful review, we're unable to move forward with <strong style="color:#0A0A0A;">${data.businessName}</strong>'s wholesale application at this time. This decision may be due to our current capacity, geographic focus, or product alignment — it is not a reflection of your business.</p>
      <p style="margin:0 0 4px;font-size:15px;color:#3D3833;line-height:1.6;">You're welcome to reapply in 90 days, and we encourage you to reach out at <a href="mailto:${BRAND_EMAIL}" style="color:#0A0A0A;">${BRAND_EMAIL}</a> with any questions.</p>
    `;
    text = `Hi ${data.contactName},

Thank you for your interest in partnering with ${BRAND_NAME}.

After careful review, we're unable to move forward with ${data.businessName}'s wholesale application at this time. This decision may be due to our current capacity, geographic focus, or product alignment — it is not a reflection of your business.

You're welcome to reapply in 90 days, and we encourage you to reach out directly with any questions at ${BRAND_EMAIL}.

We appreciate your interest and hope to have the opportunity to work together in the future.

— The ${BRAND_NAME} Team`;
  }

  const html = buildBaseHtml({ headline, bodyHtml, includeUnsubscribe: true });

  try {
    const r = getResend();
    if (!r) return { success: false, error: "Email not configured" };
    if (!isValidEmail(data.email)) return { success: false, error: "Invalid email address" };
    await r.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send application status email:", error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// sendLapsedClientEmail
// ---------------------------------------------------------------------------

export async function sendLapsedClientEmail(data: {
  name: string;
  email: string;
  businessName: string;
  daysSinceLastOrder: number;
  topProducts: { name: string; category: string }[];
}) {
  const r = getResend();
  if (!r) return null;
  if (!isValidEmail(data.email)) return null;

  const catalogUrl = `${APP_URL}/catalog`;

  const productRowsHtml = data.topProducts
    .slice(0, 3)
    .map((p, i) => {
      const bg = i % 2 === 0 ? "#F9F7F4" : "#FFFFFF";
      return `<tr style="background-color:${bg};">
        <td style="padding:10px 14px;font-size:14px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;">${p.name}</td>
        <td style="padding:10px 14px;font-size:12px;color:#C8C0B4;border-bottom:1px solid #E5E1DB;text-align:right;letter-spacing:0.06em;text-transform:uppercase;">${p.category}</td>
      </tr>`;
    })
    .join("");

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hey ${data.name},</p>
    <p style="margin:0 0 24px;font-size:15px;color:#3D3833;line-height:1.6;">It's been ${data.daysSinceLastOrder} days since your last order — we wanted to check in and make sure <strong style="color:#0A0A0A;">${data.businessName}</strong> is stocked up.</p>

    ${data.topProducts.length > 0 ? `
    <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Your Usual</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #E5E1DB;margin-bottom:28px;">
      <tbody>${productRowsHtml}</tbody>
    </table>` : ""}

    <p style="margin:0;font-size:13px;color:#C8C0B4;font-style:italic;">Reply to this email or message us anytime — ${OPS_NAME}</p>
  `;

  const html = buildBaseHtml({
    headline: "We miss you",
    bodyHtml,
    ctaText: "Shop Current Selection →",
    ctaUrl: catalogUrl,
    includeUnsubscribe: true,
  });

  const productLines = data.topProducts
    .slice(0, 3)
    .map((p) => `  • ${p.name} (${p.category})`)
    .join("\n");

  const text = `Hey ${data.name},

It's been ${data.daysSinceLastOrder} days since your last order — we wanted to check in and make sure ${data.businessName} is stocked up.

${data.topProducts.length > 0 ? `Your usual:\n${productLines}\n\n` : ""}Shop the current selection: ${catalogUrl}

Reply to this email or message us anytime — ${OPS_NAME}
${BRAND_NAME} · ${APP_URL.replace(/^https?:\/\//, "")}`;

  return r.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: `${data.businessName} — running low on anything?`,
    html,
    text,
  });
}

// ---------------------------------------------------------------------------
// sendWeeklyDigestEmail — premium weekly summary sent to active clients
// ---------------------------------------------------------------------------

export async function sendWeeklyDigestEmail(data: {
  email: string;
  name: string;
  orgName: string;
  topProductsThisWeek: { name: string; qty: number }[];
  newDrops: { title: string; description: string | null; dropDate: string }[];
  totalOrdersThisMonth: number;
  totalSpentThisMonth: number;
  reorderSuggestions: string[];
}) {
  const r = getResend();
  if (!r) return { success: false, error: "Email not configured" };
  if (!isValidEmail(data.email)) return { success: false, error: "Invalid email address" };

  const settingsUrl = `${APP_URL}/client-portal/settings`;
  const catalogUrl = `${APP_URL}/catalog`;

  const dropRows =
    data.newDrops.length > 0
      ? data.newDrops
          .map(
            (d) =>
              `<tr>
              <td style="padding:10px 12px;border-bottom:1px solid #E5E1DB;">
                <strong style="color:#0A0A0A;display:block;margin-bottom:2px">${d.title}</strong>
                ${d.description ? `<span style="color:#5c5249;font-size:13px">${d.description}</span>` : ""}
              </td>
              <td style="padding:10px 12px;border-bottom:1px solid #E5E1DB;color:#C8C0B4;font-size:12px;white-space:nowrap;vertical-align:top">
                ${new Date(d.dropDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </td>
            </tr>`
          )
          .join("")
      : "";

  const topProductRows =
    data.topProductsThisWeek.length > 0
      ? data.topProductsThisWeek
          .map(
            (p) =>
              `<tr>
              <td style="padding:8px 12px;border-bottom:1px solid #E5E1DB;color:#0A0A0A">${p.name}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #E5E1DB;color:#5c5249;text-align:right">${p.qty}x</td>
            </tr>`
          )
          .join("")
      : "";

  const reorderRows =
    data.reorderSuggestions.length > 0
      ? data.reorderSuggestions
          .map(
            (item) =>
              `<li style="padding:5px 0;color:#0A0A0A;border-bottom:1px solid #E5E1DB;">${item}</li>`
          )
          .join("")
      : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Weekly ${BRAND_NAME} Update</title>
</head>
<body style="margin:0;padding:0;background-color:#F9F7F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F7F4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border:1px solid #E5E0D8;border-radius:4px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0A0A0A;padding:28px 40px;">
              <p style="margin:0 0 4px;color:#C8C0B4;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">${BRAND_NAME}</p>
              <h1 style="margin:0;color:#FFFFFF;font-size:22px;font-weight:600;font-family:Georgia,serif;">Your Weekly ${BRAND_NAME} Update</h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:28px 40px 20px;">
              <p style="margin:0;color:#3D3833;font-size:15px;line-height:1.6;">Hi ${data.name}, here&rsquo;s a summary of what&rsquo;s new and what&rsquo;s happening in your account this week.</p>
            </td>
          </tr>

          ${
            data.newDrops.length > 0
              ? `
          <!-- Section 1: New Drops -->
          <tr><td style="padding:0 40px;"><div style="height:1px;background-color:#E5E0D8;"></div></td></tr>
          <tr>
            <td style="padding:28px 40px 20px;">
              <h2 style="margin:0 0 14px;color:#0A0A0A;font-size:13px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;">This Week&rsquo;s Top Picks</h2>
              <table style="width:100%;border-collapse:collapse;border:1px solid #E5E1DB;">
                <thead>
                  <tr style="background:#0A0A0A;color:#F9F7F4;">
                    <th style="padding:9px 12px;text-align:left;font-size:12px;font-weight:500;letter-spacing:0.06em;">Product</th>
                    <th style="padding:9px 12px;text-align:left;font-size:12px;font-weight:500;letter-spacing:0.06em;white-space:nowrap;">Available</th>
                  </tr>
                </thead>
                <tbody>${dropRows}</tbody>
              </table>
              <p style="margin:14px 0 0;">
                <a href="${catalogUrl}" style="color:#8B4513;font-size:14px;text-decoration:underline;">Browse the full catalog &rarr;</a>
              </p>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Section 2: Month So Far -->
          <tr><td style="padding:0 40px;"><div style="height:1px;background-color:#E5E0D8;"></div></td></tr>
          <tr>
            <td style="padding:28px 40px 20px;">
              <h2 style="margin:0 0 14px;color:#0A0A0A;font-size:13px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;">Your Month So Far</h2>
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:10px 14px;background:#F9F7F4;border:1px solid #E5E1DB;width:50%;">
                    <p style="margin:0;font-size:11px;color:#C8C0B4;letter-spacing:0.08em;text-transform:uppercase;">Orders</p>
                    <p style="margin:4px 0 0;font-size:26px;font-family:Georgia,serif;font-weight:400;color:#0A0A0A;">${data.totalOrdersThisMonth}</p>
                  </td>
                  <td style="padding:10px 14px;background:#F9F7F4;border:1px solid #E5E1DB;border-left:none;width:50%;">
                    <p style="margin:0;font-size:11px;color:#C8C0B4;letter-spacing:0.08em;text-transform:uppercase;">Total Spent</p>
                    <p style="margin:4px 0 0;font-size:26px;font-family:Georgia,serif;font-weight:400;color:#0A0A0A;">${formatCurrency(data.totalSpentThisMonth)}</p>
                  </td>
                </tr>
              </table>
              ${
                topProductRows
                  ? `
              <p style="margin:16px 0 8px;font-size:12px;color:#C8C0B4;letter-spacing:0.08em;text-transform:uppercase;">Top Items This Month</p>
              <table style="width:100%;border-collapse:collapse;border:1px solid #E5E1DB;">
                <tbody>${topProductRows}</tbody>
              </table>`
                  : ""
              }
            </td>
          </tr>

          ${
            data.reorderSuggestions.length > 0
              ? `
          <!-- Section 3: Reorder Suggestions -->
          <tr><td style="padding:0 40px;"><div style="height:1px;background-color:#E5E0D8;"></div></td></tr>
          <tr>
            <td style="padding:28px 40px 20px;">
              <h2 style="margin:0 0 10px;color:#0A0A0A;font-size:13px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;">Time to Reorder?</h2>
              <p style="margin:0 0 12px;color:#5c5249;font-size:14px;line-height:1.6;">It&rsquo;s been a while since your last order. Here&rsquo;s what you&rsquo;ve ordered before &mdash; ready to restock?</p>
              <ul style="margin:0;padding:0;list-style:none;">
                ${reorderRows}
              </ul>
              <p style="margin:14px 0 0;">
                <a href="${catalogUrl}" style="display:inline-block;background-color:#0A0A0A;color:#FFFFFF;font-size:13px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:2px;letter-spacing:0.04em;">Place an Order</a>
              </p>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Section 4: Coming Soon -->
          <tr><td style="padding:0 40px;"><div style="height:1px;background-color:#E5E0D8;"></div></td></tr>
          <tr>
            <td style="padding:28px 40px 20px;">
              <h2 style="margin:0 0 10px;color:#0A0A0A;font-size:13px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;">Coming Soon</h2>
              <p style="margin:0;color:#5c5249;font-size:14px;line-height:1.6;">We&rsquo;re working on new drops and seasonal arrivals for next week. Keep an eye on your inbox or check the drops calendar on your portal.</p>
              <p style="margin:12px 0 0;">
                <a href="${APP_URL}/drops" style="color:#8B4513;font-size:14px;text-decoration:underline;">View drops calendar &rarr;</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F9F7F4;padding:20px 40px;border-top:1px solid #E5E0D8;">
              <p style="margin:0;color:#888077;font-size:12px;line-height:1.7;">
                ${BRAND_NAME} &nbsp;&middot;&nbsp; ${BRAND_EMAIL}<br />
                You&rsquo;re receiving this weekly digest as a ${BRAND_NAME} wholesale partner.<br />
                <a href="${settingsUrl}" style="color:#888077;">Manage email preferences</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Your Weekly ${BRAND_NAME} Update
Hi ${data.name},

YOUR MONTH SO FAR
Orders this month: ${data.totalOrdersThisMonth}
Total spent: ${formatCurrency(data.totalSpentThisMonth)}
${
    data.newDrops.length > 0
      ? `\nTHIS WEEK'S TOP PICKS\n${data.newDrops
          .map(
            (d) =>
              `• ${d.title} (${new Date(d.dropDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })})`
          )
          .join("\n")}\n`
      : ""
  }${
    data.reorderSuggestions.length > 0
      ? `\nTIME TO REORDER?\n${data.reorderSuggestions.map((s) => `• ${s}`).join("\n")}\nPlace an order: ${catalogUrl}\n`
      : ""
  }
COMING SOON
New drops and seasonal arrivals are on the way — check the drops calendar: ${APP_URL}/drops

Manage preferences: ${settingsUrl}
— ${BRAND_NAME}`;

  try {
    await r.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Your ${BRAND_NAME} Weekly Update — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send weekly digest email:", error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// shouldSendEmail — checks org.notificationPrefs before sending.
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

// ---------------------------------------------------------------------------
// sendQuoteDeclinedInternal — internal ops alert when a client declines a quote
// ---------------------------------------------------------------------------

export async function sendQuoteDeclinedInternal(data: {
  quoteNumber: string;
  quoteId: string;
  orgName: string;
  reason?: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const OPS_EMAIL = process.env.OPS_NOTIFICATION_EMAIL || FROM_EMAIL;
  const adminUrl = `${APP_URL}/admin/quotes/${data.quoteId}`;

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
      <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#C8C0B4;font-weight:600;">Quote Declined</p>
      <h2 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#0A0A0A;">Quote #${data.quoteNumber}</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F7F4;border:1px solid #E5E1DB;margin-bottom:20px;">
        <tr><td style="padding:14px 18px;">
          <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#C8C0B4;">Client</p>
          <p style="margin:0;font-size:15px;font-weight:700;color:#0A0A0A;">${data.orgName}</p>
        </td></tr>
        ${data.reason ? `<tr><td style="padding:0 18px 14px;">
          <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#C8C0B4;">Reason</p>
          <p style="margin:0;font-size:14px;color:#3D3833;">${data.reason}</p>
        </td></tr>` : ''}
      </table>
      <a href="${adminUrl}" style="display:inline-block;background:#0A0A0A;color:#F9F7F4;padding:10px 20px;font-size:13px;font-weight:600;text-decoration:none;">View Quote →</a>
    </div>`;

  const text = `Quote #${data.quoteNumber} was declined by ${data.orgName}.${data.reason ? `\nReason: ${data.reason}` : ''}\n\nView: ${adminUrl}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: OPS_EMAIL,
    subject: `Quote #${data.quoteNumber} declined — ${data.orgName}`,
    html,
    text,
  });
}

// ---------------------------------------------------------------------------
// sendQuoteResponseToRep — notifies the assigned rep when a client accepts
// or declines their quote. Falls back gracefully if Resend is not configured.
// ---------------------------------------------------------------------------

export async function sendQuoteResponseToRep(data: {
  quoteNumber: string;
  quoteId: string;
  orgName: string;
  repName: string;
  repEmail: string;
  action: "ACCEPTED" | "DECLINED";
  orderNumber?: string;
  orderId?: string;
  reason?: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  if (!isValidEmail(data.repEmail)) return;

  const isAccepted = data.action === "ACCEPTED";
  const adminUrl = isAccepted && data.orderId
    ? `${APP_URL}/admin/orders/${data.orderId}`
    : `${APP_URL}/admin/quotes/${data.quoteId}`;

  const actionLabel = isAccepted ? "Accepted" : "Declined";
  const headline = isAccepted
    ? `${data.orgName} accepted your quote`
    : `${data.orgName} declined your quote`;

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#0A0A0A;font-size:15px;line-height:1.6;">
      Hi ${data.repName}, <strong>${data.orgName}</strong> has <strong>${actionLabel.toLowerCase()}</strong> quote <strong>${data.quoteNumber}</strong>.
    </p>
    ${isAccepted && data.orderNumber ? `
    <p style="margin:0 0 16px;color:#0A0A0A;font-size:15px;line-height:1.6;">
      An order (<strong>${data.orderNumber}</strong>) has been created and is pending your review.
    </p>` : ""}
    ${!isAccepted && data.reason ? `
    <p style="margin:0 0 16px;color:#0A0A0A;font-size:15px;line-height:1.6;">
      <strong>Reason:</strong> ${data.reason}
    </p>` : ""}
  `;

  const html = buildBaseHtml({
    headline,
    bodyHtml,
    ctaText: isAccepted ? "View Order" : "View Quote",
    ctaUrl: adminUrl,
  });

  const textParts = [
    `${headline}.`,
    isAccepted && data.orderNumber ? `Order ${data.orderNumber} created and pending review.` : "",
    !isAccepted && data.reason ? `Reason: ${data.reason}` : "",
    `View: ${adminUrl}`,
  ].filter(Boolean);

  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.repEmail,
    subject: `Quote ${data.quoteNumber} ${actionLabel} — ${data.orgName}`,
    html,
    text: textParts.join("\n\n"),
  });
}

// ---------------------------------------------------------------------------
// sendQuoteToClientEmail — notifies the client when an admin sends a quote
// ---------------------------------------------------------------------------

export async function sendQuoteToClientEmail(data: {
  quoteNumber: string;
  quoteId: string;
  clientName: string;
  clientEmail: string;
  total: number;
  expiresAt?: Date | null;
  notes?: string | null;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  if (!isValidEmail(data.clientEmail)) return;

  const quoteUrl = `${APP_URL}/client-portal/quotes/${data.quoteId}`;

  const expiryLine = data.expiresAt
    ? `<p style="margin:0 0 16px;color:#0A0A0A;font-size:15px;line-height:1.6;">
        This quote is valid until <strong>${data.expiresAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>.
       </p>`
    : "";

  const notesLine = data.notes
    ? `<p style="margin:0 0 16px;color:#0A0A0A;font-size:15px;line-height:1.6;">
        <strong>Note from our team:</strong> ${data.notes}
       </p>`
    : "";

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#0A0A0A;font-size:15px;line-height:1.6;">Hi ${data.clientName},</p>
    <p style="margin:0 0 16px;color:#0A0A0A;font-size:15px;line-height:1.6;">
      We've prepared a custom quote for you — <strong>${data.quoteNumber}</strong> for <strong>${formatCurrency(data.total)}</strong>. Please review it at your earliest convenience.
    </p>
    ${expiryLine}
    ${notesLine}
    <p style="margin:0;color:#C8C0B4;font-size:13px;">Log in to your portal to review the line items, accept the quote, or reach out with any questions.</p>
  `;

  const html = buildBaseHtml({
    headline: `New Quote — ${data.quoteNumber}`,
    bodyHtml,
    ctaText: "Review Quote →",
    ctaUrl: quoteUrl,
  });

  const textParts = [
    `Hi ${data.clientName},`,
    "",
    `We've prepared a quote for you — ${data.quoteNumber} for ${formatCurrency(data.total)}.`,
    data.expiresAt
      ? `Valid until: ${data.expiresAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
      : "",
    data.notes ? `Note: ${data.notes}` : "",
    "",
    `Review your quote: ${quoteUrl}`,
    "",
    `— ${BRAND_NAME}`,
  ].filter(Boolean);

  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.clientEmail,
    subject: `New Quote from ${BRAND_NAME} — ${data.quoteNumber}`,
    html,
    text: textParts.join("\n"),
  });
}

// ---------------------------------------------------------------------------
// sendDistributorOrderNotification
// Sent to a distributor when an order contains one or more of their products.
// Shows only their items. CCs their distributorCcEmail if set.
// ---------------------------------------------------------------------------

export interface DistributorOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export async function sendDistributorOrderNotification(data: {
  distributorName: string;
  distributorEmail: string;
  distributorCcEmail?: string | null;
  orderNumber: string;
  orderId: string;
  clientName: string;
  clientEmail: string | null;
  deliveryAddress?: string | null;
  items: DistributorOrderItem[];
  itemsTotal: number;
}) {
  const r = getResend();
  if (!r) return { success: false, error: 'Email not configured' };
  if (!isValidEmail(data.distributorEmail)) return { success: false, error: 'Invalid email address' };

  const portalUrl = `${APP_URL}/client-portal/fulfillment`;

  const itemRowsHtml = data.items
    .map((item, i) => {
      const bg = i % 2 === 0 ? '#F9F7F4' : '#FFFFFF';
      return `<tr style="background-color:${bg};">
        <td style="padding:8px 12px;font-size:13px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;">${item.name}</td>
        <td style="padding:8px 12px;font-size:13px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;font-size:13px;color:#0A0A0A;border-bottom:1px solid #E5E1DB;text-align:right;">${formatCurrency(item.total)}</td>
      </tr>`;
    })
    .join('');

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">
      A new order has been placed that includes your products. Please fulfill the items below and mark them complete in your portal.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F7F4;border:1px solid #E5E1DB;margin-bottom:20px;">
      <tr><td style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:50%;padding:0 16px 0 0;">
              <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#C8C0B4;font-weight:600;">Order</p>
              <p style="margin:0;font-size:15px;font-weight:700;color:#0A0A0A;">${data.orderNumber}</p>
            </td>
            <td style="width:50%;">
              <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#C8C0B4;font-weight:600;">Client</p>
              <p style="margin:0;font-size:15px;font-weight:700;color:#0A0A0A;">${data.clientName}</p>
              <p style="margin:2px 0 0;font-size:12px;color:#C8C0B4;">${data.clientEmail}</p>
            </td>
          </tr>
          ${data.deliveryAddress ? `
          <tr>
            <td colspan="2" style="padding-top:12px;">
              <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#C8C0B4;font-weight:600;">Deliver To</p>
              <p style="margin:0;font-size:13px;color:#0A0A0A;">${data.deliveryAddress}</p>
            </td>
          </tr>` : ''}
        </table>
      </td></tr>
    </table>

    <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#C8C0B4;font-weight:600;">Your Items to Fulfill</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #E5E1DB;margin-bottom:16px;">
      <thead>
        <tr style="background-color:#0A0A0A;">
          <th style="padding:8px 12px;text-align:left;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#FFFFFF;font-weight:600;">Product</th>
          <th style="padding:8px 12px;text-align:center;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#FFFFFF;font-weight:600;">Qty</th>
          <th style="padding:8px 12px;text-align:right;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#FFFFFF;font-weight:600;">Total</th>
        </tr>
      </thead>
      <tbody>${itemRowsHtml}</tbody>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px;">
      <tr>
        <td style="padding:8px 0;font-size:14px;font-weight:700;color:#0A0A0A;">Your Items Total</td>
        <td style="padding:8px 0;font-size:14px;font-weight:700;color:#0A0A0A;text-align:right;">${formatCurrency(data.itemsTotal)}</td>
      </tr>
    </table>
  `;

  const html = buildBaseHtml({
    headline: `New Order: ${data.orderNumber}`,
    bodyHtml,
    ctaText: 'View Fulfillment Queue →',
    ctaUrl: portalUrl,
  });

  const text = `New order requires your fulfillment.

Order: ${data.orderNumber}
Client: ${data.clientName}
${data.deliveryAddress ? `Deliver to: ${data.deliveryAddress}\n` : ''}
Your items:
${data.items.map(i => `  - ${i.name} × ${i.quantity} — ${formatCurrency(i.total)}`).join('\n')}

Your items total: ${formatCurrency(data.itemsTotal)}

View your fulfillment queue: ${portalUrl}`;

  const toAddresses = [data.distributorEmail];
  if (data.distributorCcEmail && data.distributorCcEmail !== data.distributorEmail) {
    toAddresses.push(data.distributorCcEmail);
  }

  try {
    await r.emails.send({
      from: FROM_EMAIL,
      to: toAddresses,
      subject: `Fulfillment Required: ${data.orderNumber} — ${data.clientName}`,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send distributor order notification:', error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// sendPaymentReceivedEmail — sent to client when a payment is recorded
// (invoice.paid, manual payment, etc.)
// ---------------------------------------------------------------------------

export async function sendPaymentReceivedEmail(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  method?: string;
}) {
  const orderUrl = `${APP_URL}/client-portal/orders/${data.orderNumber}`;
  const methodLabel = data.method ?? "payment";

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.customerName},</p>
    <p style="margin:0 0 24px;font-size:15px;color:#3D3833;line-height:1.6;">
      We've received your ${methodLabel} of <strong style="color:#0A0A0A;">${formatCurrency(data.amount)}</strong> for order
      <strong style="color:#0A0A0A;">${data.orderNumber}</strong>. Thank you!
    </p>
    <p style="margin:0 0 8px;font-size:13px;color:#C8C0B4;font-style:italic;">
      If you have any questions about this payment, reply to this email or reach out through your portal.
    </p>
  `;

  const html = buildBaseHtml({
    headline: "Payment Received",
    bodyHtml,
    ctaText: "View Order →",
    ctaUrl: orderUrl,
  });

  const text = `Hi ${data.customerName},

We've received your ${methodLabel} of ${formatCurrency(data.amount)} for order ${data.orderNumber}. Thank you!

View your order: ${orderUrl}

— ${BRAND_NAME}`;

  try {
    const r = getResend();
    if (!r) return { success: false, error: "Email not configured" };
    if (!isValidEmail(data.customerEmail)) return { success: false, error: "Invalid email address" };
    await r.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Payment Received — ${data.orderNumber}`,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send payment received email:", error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// sendRefundConfirmationEmail — sent to client when a refund is processed
// ---------------------------------------------------------------------------

export async function sendRefundConfirmationEmail(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amountRefunded: number;
  isPartial: boolean;
}) {
  const orderUrl = `${APP_URL}/client-portal/orders/${data.orderNumber}`;
  const refundType = data.isPartial ? "partial refund" : "full refund";

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.customerName},</p>
    <p style="margin:0 0 24px;font-size:15px;color:#3D3833;line-height:1.6;">
      A ${refundType} of <strong style="color:#0A0A0A;">${formatCurrency(data.amountRefunded)}</strong> has been issued for order
      <strong style="color:#0A0A0A;">${data.orderNumber}</strong>. The refund should appear on your statement within 5–10 business days.
    </p>
    <p style="margin:0 0 8px;font-size:13px;color:#C8C0B4;font-style:italic;">
      If you have any questions about this refund, reply to this email or reach out through your portal.
    </p>
  `;

  const html = buildBaseHtml({
    headline: "Refund Processed",
    bodyHtml,
    ctaText: "View Order",
    ctaUrl: orderUrl,
  });

  const text = `Hi ${data.customerName},

A ${refundType} of ${formatCurrency(data.amountRefunded)} has been issued for order ${data.orderNumber}. The refund should appear on your statement within 5-10 business days.

View your order: ${orderUrl}

— ${BRAND_NAME}`;

  try {
    const r = getResend();
    if (!r) return { success: false, error: "Email not configured" };
    if (!isValidEmail(data.customerEmail)) return { success: false, error: "Invalid email address" };
    await r.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Refund Processed — ${data.orderNumber}`,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send refund confirmation email:", error);
    return { success: false, error };
  }
}

// ---------------------------------------------------------------------------
// sendDisputeAlertEmail — internal alert when a Stripe dispute is opened
// ---------------------------------------------------------------------------

export async function sendDisputeAlertEmail(data: {
  disputeId: string;
  reason: string;
  amount: number;
  paymentIntentId: string;
  orderNumber?: string;
}) {
  const OPS_EMAIL = process.env.OPS_NOTIFICATION_EMAIL || FROM_EMAIL;
  const dashboardUrl = `https://dashboard.stripe.com/disputes/${data.disputeId}`;
  const orderRef = data.orderNumber
    ? ` (Order ${data.orderNumber})`
    : "";

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">A new Stripe dispute has been opened${orderRef}.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td style="padding:8px 0;font-size:14px;color:#6B6560;border-bottom:1px solid #E8E4DF;">Dispute ID</td>
          <td style="padding:8px 0;font-size:14px;color:#0A0A0A;border-bottom:1px solid #E8E4DF;font-weight:600;">${data.disputeId}</td></tr>
      <tr><td style="padding:8px 0;font-size:14px;color:#6B6560;border-bottom:1px solid #E8E4DF;">Reason</td>
          <td style="padding:8px 0;font-size:14px;color:#0A0A0A;border-bottom:1px solid #E8E4DF;font-weight:600;">${data.reason}</td></tr>
      <tr><td style="padding:8px 0;font-size:14px;color:#6B6560;border-bottom:1px solid #E8E4DF;">Amount</td>
          <td style="padding:8px 0;font-size:14px;color:#0A0A0A;border-bottom:1px solid #E8E4DF;font-weight:600;">${formatCurrency((data.amount / 100))}</td></tr>
      <tr><td style="padding:8px 0;font-size:14px;color:#6B6560;">Payment Intent</td>
          <td style="padding:8px 0;font-size:14px;color:#0A0A0A;font-weight:600;">${data.paymentIntentId}</td></tr>
    </table>
    <p style="margin:0 0 8px;font-size:13px;color:#C8C0B4;font-style:italic;">
      Respond within 7 days to avoid an automatic loss.
    </p>
  `;

  const html = buildBaseHtml({
    headline: "Dispute Opened",
    bodyHtml,
    ctaText: "View in Stripe",
    ctaUrl: dashboardUrl,
    alertBannerHtml: `<p style="margin:0;font-size:13px;font-weight:600;color:#92400E;">ACTION REQUIRED — A payment dispute needs your attention</p>`,
  });

  const text = `DISPUTE OPENED${orderRef}

Dispute ID: ${data.disputeId}
Reason: ${data.reason}
Amount: ${formatCurrency((data.amount / 100))}
Payment Intent: ${data.paymentIntentId}

View in Stripe: ${dashboardUrl}

Respond within 7 days to avoid an automatic loss.

— ${BRAND_NAME}`;

  try {
    const r = getResend();
    if (!r) return { success: false, error: "Email not configured" };
    await r.emails.send({
      from: FROM_EMAIL,
      to: OPS_EMAIL,
      subject: `DISPUTE OPENED — ${formatCurrency((data.amount / 100))}${orderRef}`,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send dispute alert email:", error);
    return { success: false, error };
  }
}
