// ---------------------------------------------------------------------------
// Barrel file: re-exports every email function so existing imports from
// "@/lib/email" or "@/lib/email/index" continue to work unchanged.
// ---------------------------------------------------------------------------

// Shared infrastructure (buildBaseHtml, types, helpers)
export {
  buildBaseHtml,
  isValidEmail,
  getResend,
  shouldSendEmail,
  FROM_EMAIL,
  APP_URL,
  OPS_NAME,
  BRAND_NAME,
  BRAND_LOCATION,
  BRAND_EMAIL,
  BRAND_COLOR,
} from "./shared";
export type { BaseHtmlOptions, OrderEmailData } from "./shared";

// Order / fulfillment
export {
  sendOrderConfirmation,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendInternalOrderNotification,
  sendDistributorOrderNotification,
} from "./order-emails";
export type { DistributorOrderItem } from "./order-emails";

// Invoice / payment / quotes / disputes
export {
  sendInvoiceEmail,
  sendPaymentReceivedEmail,
  sendRefundConfirmationEmail,
  sendQuoteToClientEmail,
  sendQuoteDeclinedInternal,
  sendQuoteResponseToRep,
  sendDisputeAlertEmail,
} from "./invoice-emails";

// Onboarding / partner lifecycle
export {
  sendWelcomePartnerEmail,
  sendWholesaleRejectionEmail,
  sendApplicationStatusEmail,
  sendTierUpgradeEmail,
} from "./onboarding-emails";

// Onboarding drip sequence
export {
  sendPartnerDay3Email,
  sendPartnerDay7Email,
  sendPartnerDay3StandingOrdersEmail,
  sendPartnerDay7AnalyticsEmail,
} from "./onboarding-drip-emails";

// Marketing / growth / retention
export {
  sendDropAlertEmail,
  sendDropBlastEmail,
  sendAbandonedCartEmail,
  sendLapsedClientEmail,
  sendWeeklyDigestEmail,
} from "./marketing-emails";

// Admin / ops
export { sendLowStockAlert } from "./admin-emails";
