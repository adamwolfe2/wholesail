/**
 * Clerk Platform API integration for automated application provisioning.
 *
 * Uses the Clerk Platform API (beta) to programmatically create new Clerk
 * applications and retrieve their API keys — eliminating manual Clerk setup.
 *
 * Requires: CLERK_PLATFORM_TOKEN env var (Platform API access token,
 * separate from per-instance secret keys).
 *
 * If the Platform API token is not configured, falls back to generating
 * manual setup instructions.
 *
 * API Reference: https://github.com/clerk/openapi-specs/blob/main/platform/beta.yml
 */

const CLERK_PLATFORM_API = "https://api.clerk.com/v1";

function platformHeaders() {
  const token = process.env.CLERK_PLATFORM_TOKEN;
  if (!token) throw new Error("CLERK_PLATFORM_TOKEN not set");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// ── Types ────────────────────────────────────────────────────────────────

export interface ClerkInstance {
  instanceId: string;
  environmentType: "development" | "production";
  secretKey: string;
  publishableKey: string;
}

export interface ClerkAppResult {
  applicationId: string;
  name: string;
  instances: ClerkInstance[];
}

// ── Platform API ─────────────────────────────────────────────────────────

/**
 * Check whether the Platform API is available (token configured).
 */
export function isPlatformApiAvailable(): boolean {
  return !!process.env.CLERK_PLATFORM_TOKEN;
}

/**
 * Create a new Clerk application via the Platform API.
 * Returns the application ID and all instance keys (dev + production).
 *
 * @param name - Display name for the application (e.g. "acme-portal")
 * @param domain - Optional production domain (e.g. "portal.acme.com")
 */
export async function createClerkApp(
  name: string,
  domain?: string
): Promise<ClerkAppResult> {
  const body: Record<string, unknown> = {
    name,
    environment_types: ["development", "production"],
  };
  if (domain) body.domain = domain;

  const res = await fetch(`${CLERK_PLATFORM_API}/platform/applications`, {
    method: "POST",
    headers: platformHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(
      `Clerk Platform API createApp failed (${res.status}): ${errBody}`
    );
  }

  const data = await res.json();

  return {
    applicationId: data.application_id,
    name: data.name,
    instances: (data.instances ?? []).map(
      (inst: Record<string, string>) => ({
        instanceId: inst.instance_id,
        environmentType: inst.environment_type as "development" | "production",
        secretKey: inst.secret_key,
        publishableKey: inst.publishable_key,
      })
    ),
  };
}

/**
 * Get the production instance keys from a ClerkAppResult.
 * Falls back to the first available instance if no production env exists.
 */
export function getProductionKeys(
  app: ClerkAppResult
): { publishableKey: string; secretKey: string } | null {
  const prod = app.instances.find((i) => i.environmentType === "production");
  const fallback = app.instances[0];
  const inst = prod ?? fallback;
  if (!inst) return null;
  return {
    publishableKey: inst.publishableKey,
    secretKey: inst.secretKey,
  };
}

/**
 * Full automated Clerk provisioning for a new portal build.
 * Creates the app, returns keys ready to be set as env vars.
 *
 * Returns null if Platform API is not available (caller should fall back
 * to manual instructions).
 */
export async function provisionClerkApp(
  repoName: string,
  domain?: string
): Promise<{
  applicationId: string;
  publishableKey: string;
  secretKey: string;
  allInstances: ClerkInstance[];
} | null> {
  if (!isPlatformApiAvailable()) return null;

  const app = await createClerkApp(repoName, domain);
  const keys = getProductionKeys(app);

  if (!keys) {
    throw new Error(
      `Clerk app "${repoName}" created (${app.applicationId}) but no instance keys returned`
    );
  }

  return {
    applicationId: app.applicationId,
    publishableKey: keys.publishableKey,
    secretKey: keys.secretKey,
    allInstances: app.instances,
  };
}

// ── Fallback: Manual Instructions ────────────────────────────────────────

/**
 * Returns step-by-step instructions for creating a Clerk app and
 * configuring its webhook for a newly built portal.
 * Used when Platform API is not available.
 */
export function generateClerkWebhookInstructions(repoName: string): string {
  const webhookUrl = `https://${repoName}.vercel.app/api/webhooks/clerk`;
  const events = [
    "user.created",
    "user.updated",
    "user.deleted",
    "organization.created",
    "organization.updated",
  ];

  return [
    `## Clerk Setup Instructions for ${repoName}`,
    "",
    "### 1. Create the Clerk Application",
    "1. Go to https://dashboard.clerk.com and sign in.",
    "2. Click 'Add application' in the sidebar.",
    `3. Name it: "${repoName}"`,
    "4. Select authentication methods: Email, Google (minimum).",
    "5. Click 'Create application'.",
    "",
    "### 2. Copy API Keys",
    "1. In the new app dashboard, go to 'API Keys'.",
    "2. Copy the **Publishable Key** (starts with `pk_`).",
    "3. Copy the **Secret Key** (starts with `sk_`).",
    "4. Set both as env vars in the Vercel project:",
    "   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`",
    "   - `CLERK_SECRET_KEY`",
    "",
    "### 3. Configure Webhook",
    "1. In the Clerk dashboard, go to 'Webhooks'.",
    "2. Click 'Add Endpoint'.",
    `3. Endpoint URL: \`${webhookUrl}\``,
    "4. Subscribe to these events:",
    ...events.map((e) => `   - \`${e}\``),
    "5. Click 'Create'.",
    "6. Copy the **Signing Secret** (starts with `whsec_`).",
    "7. Set it as env var in the Vercel project:",
    "   - `CLERK_WEBHOOK_SECRET`",
    "",
    "### 4. Verify",
    "1. Deploy the project so the webhook route is live.",
    "2. In the Clerk webhook settings, click 'Test' to send a test event.",
    "3. Confirm the webhook returns 200.",
  ].join("\n");
}

/**
 * Validates a pair of Clerk API keys by making a test request.
 * Returns true if the secret key is valid, false otherwise.
 */
export async function validateClerkKeys(
  publishableKey: string,
  secretKey: string
): Promise<boolean> {
  if (!publishableKey.startsWith("pk_")) return false;
  if (!secretKey.startsWith("sk_")) return false;

  try {
    const res = await fetch("https://api.clerk.com/v1/users?limit=1", {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}
