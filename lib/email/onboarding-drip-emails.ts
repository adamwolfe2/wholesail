// ---------------------------------------------------------------------------
// Onboarding drip emails: partner day-3/7 nudges, standing orders guide,
// and analytics guide. Sent on a schedule after partner approval.
// ---------------------------------------------------------------------------
import {
  getResend,
  isValidEmail,
  buildBaseHtml,
  FROM_EMAIL,
  APP_URL,
  BRAND_NAME,
  BRAND_EMAIL,
} from "./shared";

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

export async function sendPartnerDay3StandingOrdersEmail(data: {
  name: string;
  email: string;
  businessName: string;
}) {
  const standingOrdersUrl = `${APP_URL}/client-portal/standing-orders`;

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.name},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Now that you've explored the catalog, here's how to save time on repeat orders.</p>

    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Standing Orders</p>
    <p style="margin:0 0 16px;font-size:14px;color:#3D3833;line-height:1.6;">
      Set up a standing order for your staple items and we'll automatically place them on your chosen schedule -- weekly, bi-weekly, or monthly. No more forgetting to reorder.
    </p>

    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">How It Works</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="padding:0 0 10px;">
        <p style="margin:0;font-size:14px;color:#3D3833;line-height:1.6;"><strong style="color:#0A0A0A;">1. Name your order</strong> -- e.g., "Weekly Kitchen Staples"</p>
      </td></tr>
      <tr><td style="padding:0 0 10px;">
        <p style="margin:0;font-size:14px;color:#3D3833;line-height:1.6;"><strong style="color:#0A0A0A;">2. Add products</strong> -- pick from the catalog and set quantities</p>
      </td></tr>
      <tr><td style="padding:0 0 10px;">
        <p style="margin:0;font-size:14px;color:#3D3833;line-height:1.6;"><strong style="color:#0A0A0A;">3. Set a schedule</strong> -- choose how often and when it starts</p>
      </td></tr>
      <tr><td>
        <p style="margin:0;font-size:14px;color:#3D3833;line-height:1.6;"><strong style="color:#0A0A0A;">4. We handle the rest</strong> -- orders auto-placed, you get an email confirmation each time</p>
      </td></tr>
    </table>

    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Saved Carts</p>
    <p style="margin:0;font-size:14px;color:#3D3833;line-height:1.6;">
      Not ready for auto-reorder? You can also save any cart as a template and load it with one click when you need it.
    </p>
  `;

  const html = buildBaseHtml({
    headline: "Never run out of your staples",
    bodyHtml,
    ctaText: "Set Up a Standing Order",
    ctaUrl: standingOrdersUrl,
    includeUnsubscribe: true,
  });

  const text = `Hi ${data.name},

Now that you've explored the catalog, here's how to save time on repeat orders.

STANDING ORDERS
Set up a standing order for your staple items and we'll automatically place them on your chosen schedule.

1. Name your order
2. Add products and quantities
3. Set a schedule (weekly, bi-weekly, or monthly)
4. We handle the rest

Set up a standing order: ${standingOrdersUrl}

SAVED CARTS
Not ready for auto-reorder? Save any cart as a template and load it with one click.

-- The ${BRAND_NAME} Team`;

  try {
    const r = getResend();
    if (!r) return { success: false, error: "Email not configured" };
    if (!isValidEmail(data.email)) return { success: false, error: "Invalid email address" };
    await r.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Never run out -- set up auto-reorder for ${data.businessName}`,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Send failed" };
  }
}

export async function sendPartnerDay7AnalyticsEmail(data: {
  name: string;
  email: string;
  businessName: string;
}) {
  const analyticsUrl = `${APP_URL}/client-portal/analytics`;
  const dashboardUrl = `${APP_URL}/client-portal/dashboard`;

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">Hi ${data.name},</p>
    <p style="margin:0 0 20px;font-size:15px;color:#3D3833;line-height:1.6;">One last thing -- your portal has a full analytics dashboard built in. Here's what you can track:</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F7F4;border:1px solid #E5E1DB;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;border-bottom:1px solid #E5E1DB;">
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Dashboard</p>
        <p style="margin:0;font-size:14px;color:#3D3833;line-height:1.5;">Total spend, order count, average order value, and your top products -- all at a glance.</p>
      </td></tr>
      <tr><td style="padding:16px 20px;border-bottom:1px solid #E5E1DB;">
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Spending Trends</p>
        <p style="margin:0;font-size:14px;color:#3D3833;line-height:1.5;">Monthly spending charts, category breakdowns, and order frequency patterns to help you budget.</p>
      </td></tr>
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#C8C0B4;font-weight:600;">Quick Reorder</p>
        <p style="margin:0;font-size:14px;color:#3D3833;line-height:1.5;">Your most-ordered products appear on the dashboard for one-tap reordering.</p>
      </td></tr>
    </table>

    <p style="margin:0;font-size:15px;color:#3D3833;line-height:1.6;">
      That's everything. You're fully set up. If you ever need anything, just reply to this email -- we read every message.
    </p>
  `;

  const html = buildBaseHtml({
    headline: "Track your spending and trends",
    bodyHtml,
    ctaText: "View Your Analytics",
    ctaUrl: analyticsUrl,
    includeUnsubscribe: true,
  });

  const text = `Hi ${data.name},

One last thing -- your portal has a full analytics dashboard.

DASHBOARD: Total spend, order count, average order value, and top products at a glance.
SPENDING TRENDS: Monthly charts, category breakdowns, and order frequency patterns.
QUICK REORDER: Your most-ordered products appear for one-tap reordering.

View your analytics: ${analyticsUrl}

That's everything. You're fully set up. Reply to this email anytime -- we read every message.

-- The ${BRAND_NAME} Team`;

  try {
    const r = getResend();
    if (!r) return { success: false, error: "Email not configured" };
    if (!isValidEmail(data.email)) return { success: false, error: "Invalid email address" };
    await r.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Your ${BRAND_NAME} analytics dashboard -- track spending and trends`,
      html,
      text,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Send failed" };
  }
}
