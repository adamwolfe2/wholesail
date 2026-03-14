import Stripe from "stripe";

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });
}

interface CreateConnectedAccountInput {
  companyName: string;
  contactEmail: string;
  industry: string;
  website: string | null;
  country?: string; // default "US"
}

interface ConnectedAccountResult {
  accountId: string;
  onboardingUrl: string;
}

/**
 * Create a Stripe Express Connected Account for a new client portal.
 * Returns the account ID and an onboarding link to send to the client.
 */
export async function createConnectedAccount(
  input: CreateConnectedAccountInput
): Promise<ConnectedAccountResult> {
  const stripe = getStripe();

  const account = await stripe.accounts.create({
    type: "express",
    country: input.country ?? "US",
    email: input.contactEmail,
    business_type: "company",
    company: {
      name: input.companyName,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      platform: "wholesail",
      industry: input.industry,
      ...(input.website ? { website: input.website } : {}),
    },
  });

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://wholesailhub.com";

  // Create an account onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${appUrl}/admin/pipeline`,
    return_url: `${appUrl}/admin/pipeline?stripe_connected=true`,
    type: "account_onboarding",
  });

  return {
    accountId: account.id,
    onboardingUrl: accountLink.url,
  };
}

/**
 * Check if a connected account has completed onboarding.
 */
export async function getAccountStatus(accountId: string): Promise<{
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}> {
  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(accountId);
  return {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  };
}

/**
 * Generate a fresh onboarding link (if the old one expired).
 */
export async function refreshOnboardingLink(
  accountId: string
): Promise<string> {
  const stripe = getStripe();
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://wholesailhub.com";

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/admin/pipeline`,
    return_url: `${appUrl}/admin/pipeline?stripe_connected=true`,
    type: "account_onboarding",
  });
  return accountLink.url;
}
