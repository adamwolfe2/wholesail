// ---------------------------------------------------------------------------
// Onboarding emails: welcome, rejection, application status, tier upgrade.
// ---------------------------------------------------------------------------
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
