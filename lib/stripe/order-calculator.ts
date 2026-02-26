/**
 * TBGC Stripe Integration — Order Calculator
 *
 * Computes subtotals, volume discounts, tax, and totals.
 * All outputs in CENTS (integers). Input prices in dollars.
 */

import type { OrderCalculation, OrderLineItemInput } from "./types";
import { VOLUME_DISCOUNT_TIERS, TAX_RATES } from "./constants";
import { dollarsToCents } from "./format";

interface CalculateOrderOptions {
  items: OrderLineItemInput[];
  /** Override discount percent (0–100). If omitted, volume tiers apply. */
  discountPct?: number;
  /** Tax rate as a decimal (e.g. 0.0875). Defaults to CA rate. */
  taxRate?: number;
  /** Pass true for tax-exempt organisations (restaurants with resale cert) */
  taxExempt?: boolean;
}

/**
 * Calculate order totals for display and Stripe checkout creation.
 */
export function calculateOrder(options: CalculateOrderOptions): OrderCalculation {
  const { items, taxExempt = false } = options;

  // Subtotal (cents)
  const subtotalCents = items.reduce((sum, item) => {
    const effectivePrice = item.weightLbs
      ? item.unitPriceDollars * item.weightLbs
      : item.unitPriceDollars;
    return sum + dollarsToCents(effectivePrice) * item.quantity;
  }, 0);

  // Discount
  let discountPct = options.discountPct ?? 0;
  if (options.discountPct === undefined) {
    // Apply best matching volume tier
    const subtotalDollars = subtotalCents / 100;
    for (const tier of [...VOLUME_DISCOUNT_TIERS].reverse()) {
      if (subtotalDollars >= tier.minSubtotalDollars) {
        discountPct = tier.pct;
        break;
      }
    }
  }

  const discountCents = Math.round(subtotalCents * (discountPct / 100));
  const afterDiscountCents = subtotalCents - discountCents;

  // Tax
  const taxRate = taxExempt
    ? TAX_RATES.EXEMPT
    : (options.taxRate ?? TAX_RATES.CA_DEFAULT);
  const taxCents = Math.round(afterDiscountCents * taxRate);

  const totalCents = afterDiscountCents + taxCents;

  return {
    subtotalCents,
    discountCents,
    discountPct,
    taxCents,
    taxRate,
    totalCents,
    totalDollars: parseFloat((totalCents / 100).toFixed(2)),
  };
}

/**
 * Build Stripe line_items array from order line items (prices in cents).
 * Ready to pass directly to stripe.checkout.sessions.create().
 */
export function buildStripeLineItems(
  items: OrderLineItemInput[]
): Array<{ price_data: { currency: string; product_data: { name: string }; unit_amount: number }; quantity: number }> {
  return items.map((item) => {
    const effectivePrice = item.weightLbs
      ? item.unitPriceDollars * item.weightLbs
      : item.unitPriceDollars;
    return {
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: dollarsToCents(effectivePrice),
      },
      quantity: item.quantity,
    };
  });
}
