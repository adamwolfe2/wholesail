import Stripe from "stripe";

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
    httpClient: Stripe.createNodeHttpClient(),
  });
}

interface CreateCheckoutInput {
  orderId: string;
  orderNumber: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number; // in dollars
  }[];
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  /** Stripe Connect account ID — if set, payment goes to this connected account */
  stripeAccountId?: string | null;
  /** Platform fee percentage (e.g. 2.5 for 2.5%). Only applied when stripeAccountId is set. */
  platformFeePercent?: number | null;
}

export async function createCheckoutSession(input: CreateCheckoutInput) {
  const stripe = getStripe();

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    customer_email: input.customerEmail,
    line_items: input.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.unitPrice * 100),
      },
      quantity: item.quantity,
    })),
    metadata: {
      orderId: input.orderId,
      orderNumber: input.orderNumber,
    },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  };

  // Stripe Connect: route payment to the connected account + collect platform fee
  if (input.stripeAccountId) {
    const feePercent = input.platformFeePercent ?? 2.5;
    if (feePercent > 0) {
      // Calculate total in cents for the fee
      const totalCents = input.items.reduce(
        (sum, item) => sum + Math.round(item.unitPrice * 100) * item.quantity,
        0
      );
      const applicationFeeAmount = Math.round(
        totalCents * (feePercent / 100)
      );
      sessionParams.payment_intent_data = {
        ...sessionParams.payment_intent_data,
        application_fee_amount: applicationFeeAmount,
      };
    }
  }

  const stripeOptions: Stripe.RequestOptions | undefined = input.stripeAccountId
    ? { stripeAccount: input.stripeAccountId }
    : undefined;

  const session = await stripe.checkout.sessions.create(sessionParams, stripeOptions);

  return session;
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  return getStripe().webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
