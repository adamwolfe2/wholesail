// ---------------------------------------------------------------------------
// Invoice, payment, refund, quote, and dispute emails.
// ---------------------------------------------------------------------------
import { formatCurrency } from "@/lib/utils";
import {
  getResend,
  isValidEmail,
  buildBaseHtml,
  FROM_EMAIL,
  APP_URL,
  BRAND_NAME,
} from "./shared";

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
// sendPaymentReceivedEmail
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
// sendRefundConfirmationEmail
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
// sendQuoteToClientEmail
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
// sendQuoteDeclinedInternal
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
// sendQuoteResponseToRep
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
// sendDisputeAlertEmail
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
