/**
 * Resend Admin API — create a dedicated API key per client portal.
 *
 * Each client gets their own Resend API key so email volume, bounce rates,
 * and costs can be tracked and attributed per client independently.
 *
 * Key IDs are stored in Project.serviceKeys for future cost/usage queries
 * via GET https://api.resend.com/api-keys/{id}
 */

const RESEND_API = "https://api.resend.com";

export interface ResendApiKey {
  keyId: string;  // permanent ID — use this for cost tracking queries
  token: string;  // re_xxx — the actual RESEND_API_KEY value (returned once only)
}

/**
 * Creates a new Resend API key scoped to a single client portal.
 * Uses the Wholesail master Resend key to create the child key.
 *
 * @param name  Display name (max 50 chars) — e.g. "TBGC Portal"
 */
export async function createResendApiKey(name: string): Promise<ResendApiKey> {
  const masterKey = process.env.RESEND_API_KEY;
  if (!masterKey) throw new Error("RESEND_API_KEY not set — cannot provision client key");

  const res = await fetch(`${RESEND_API}/api-keys`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${masterKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name.slice(0, 50),
      permission: "full_access",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend createApiKey failed (${res.status}): ${body}`);
  }

  const data = await res.json();

  if (!data.token || !data.id) {
    throw new Error(`Unexpected Resend response: ${JSON.stringify(data)}`);
  }

  return { keyId: data.id, token: data.token };
}
