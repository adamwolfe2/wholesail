// ---------------------------------------------------------------------------
// Admin / ops emails: low stock alerts, weekly reports, intake notifications.
// ---------------------------------------------------------------------------
import { portalConfig } from "@/lib/portal-config";
import {
  getResend,
  buildBaseHtml,
  FROM_EMAIL,
  APP_URL,
  BRAND_NAME,
} from "./shared";

// ---------------------------------------------------------------------------
// sendLowStockAlert -- internal ops email (dark theme)
//
// REFACTORED: now uses buildBaseHtml with a dark theme override instead of
// hand-rolled HTML, keeping consistent structure while preserving the dark
// ops aesthetic.
// ---------------------------------------------------------------------------

const DARK_THEME = {
  outerBg: "#0A0A0A",
  innerBg: "#111111",
  headerBg: "#0A0A0A",
  headerText: "#F9F7F4",
  footerBg: "#111111",
  footerText: "#C8C0B4",
  footerSubText: "#C8C0B4",
  headlineColor: "#F9F7F4",
  border: "#2A2A2A",
} as const;

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

  const bodyHtml = `
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
  `;

  const html = buildBaseHtml({
    headline: "Low Stock Alert",
    bodyHtml,
    theme: DARK_THEME,
  });

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
