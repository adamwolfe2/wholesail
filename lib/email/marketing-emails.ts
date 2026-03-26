// ---------------------------------------------------------------------------
// Marketing emails: drops, abandoned cart, lapsed client, weekly digest,
// referral, and other growth/retention emails.
// ---------------------------------------------------------------------------
import { formatCurrency } from "@/lib/utils";
import {
  getResend,
  isValidEmail,
  buildBaseHtml,
  FROM_EMAIL,
  APP_URL,
  OPS_NAME,
  BRAND_NAME,
  BRAND_EMAIL,
} from "./shared";

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
// sendWeeklyDigestEmail -- premium weekly summary sent to active clients
//
// REFACTORED: now uses buildBaseHtml instead of raw HTML for consistent
// branding and maintenance.
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

  // -- New Drops section --
  const dropsSection =
    data.newDrops.length > 0
      ? `
    <p style="margin:0 0 14px;font-size:13px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;color:#0A0A0A;">This Week's Top Picks</p>
    <table style="width:100%;border-collapse:collapse;border:1px solid #E5E1DB;margin-bottom:14px;">
      <thead>
        <tr style="background:#0A0A0A;color:#F9F7F4;">
          <th style="padding:9px 12px;text-align:left;font-size:12px;font-weight:500;letter-spacing:0.06em;">Product</th>
          <th style="padding:9px 12px;text-align:left;font-size:12px;font-weight:500;letter-spacing:0.06em;white-space:nowrap;">Available</th>
        </tr>
      </thead>
      <tbody>${data.newDrops
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
        .join("")}</tbody>
    </table>
    <p style="margin:0 0 24px;">
      <a href="${catalogUrl}" style="color:#8B4513;font-size:14px;text-decoration:underline;">Browse the full catalog &rarr;</a>
    </p>
    <div style="height:1px;background-color:#E5E0D8;margin:0 0 24px;"></div>`
      : "";

  // -- Month stats --
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

  const monthSection = `
    <p style="margin:0 0 14px;font-size:13px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;color:#0A0A0A;">Your Month So Far</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
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
    <p style="margin:0 0 8px;font-size:12px;color:#C8C0B4;letter-spacing:0.08em;text-transform:uppercase;">Top Items This Month</p>
    <table style="width:100%;border-collapse:collapse;border:1px solid #E5E1DB;margin-bottom:24px;">
      <tbody>${topProductRows}</tbody>
    </table>`
        : ""
    }
    <div style="height:1px;background-color:#E5E0D8;margin:0 0 24px;"></div>`;

  // -- Reorder suggestions --
  const reorderSection =
    data.reorderSuggestions.length > 0
      ? `
    <p style="margin:0 0 10px;font-size:13px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;color:#0A0A0A;">Time to Reorder?</p>
    <p style="margin:0 0 12px;color:#5c5249;font-size:14px;line-height:1.6;">It's been a while since your last order. Here's what you've ordered before -- ready to restock?</p>
    <ul style="margin:0 0 14px;padding:0;list-style:none;">
      ${data.reorderSuggestions
        .map(
          (item) =>
            `<li style="padding:5px 0;color:#0A0A0A;border-bottom:1px solid #E5E1DB;">${item}</li>`
        )
        .join("")}
    </ul>
    <p style="margin:0 0 24px;">
      <a href="${catalogUrl}" style="display:inline-block;background-color:#0A0A0A;color:#FFFFFF;font-size:13px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:2px;letter-spacing:0.04em;">Place an Order</a>
    </p>
    <div style="height:1px;background-color:#E5E0D8;margin:0 0 24px;"></div>`
      : "";

  // -- Coming soon --
  const comingSoonSection = `
    <p style="margin:0 0 10px;font-size:13px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;color:#0A0A0A;">Coming Soon</p>
    <p style="margin:0 0 12px;color:#5c5249;font-size:14px;line-height:1.6;">We're working on new drops and seasonal arrivals for next week. Keep an eye on your inbox or check the drops calendar on your portal.</p>
    <p style="margin:0;">
      <a href="${APP_URL}/drops" style="color:#8B4513;font-size:14px;text-decoration:underline;">View drops calendar &rarr;</a>
    </p>`;

  // -- Compose body --
  const bodyHtml = `
    <p style="margin:0 0 24px;color:#3D3833;font-size:15px;line-height:1.6;">Hi ${data.name}, here's a summary of what's new and what's happening in your account this week.</p>
    ${dropsSection}
    ${monthSection}
    ${reorderSection}
    ${comingSoonSection}
  `;

  const html = buildBaseHtml({
    headline: `Your Weekly ${BRAND_NAME} Update`,
    bodyHtml,
    includeUnsubscribe: true,
  });

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
