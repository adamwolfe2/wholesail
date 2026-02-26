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
}

export async function createCheckoutSession(input: CreateCheckoutInput) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
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
  });

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
