import { prisma } from "@/lib/db";
import crypto from "crypto";

const MAX_RETRIES = 5;
const TIMEOUT_MS = 10_000;

export type WebhookEvent =
  | "order.created"
  | "order.status_changed"
  | "invoice.created"
  | "payment.received";

/**
 * Dispatch a webhook event to all active endpoints subscribed to it.
 * Non-blocking — fires and forgets. On failure, queues for cron-based retry.
 */
export async function dispatchWebhook(
  event: WebhookEvent,
  payload: Record<string, unknown>,
) {
  try {
    const endpoints = await prisma.webhookEndpoint.findMany({
      where: {
        isActive: true,
        events: { has: event },
      },
    });

    if (endpoints.length === 0) return;

    const body = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    for (const endpoint of endpoints) {
      // Fire without blocking
      deliverWebhook(endpoint.id, endpoint.url, endpoint.secret, event, body, 1).catch(
        (err) => console.error(`Webhook delivery error (${endpoint.id}):`, err),
      );
    }
  } catch (err) {
    console.error("Error dispatching webhooks:", err);
  }
}

/**
 * Attempt a single webhook delivery. Used by both initial dispatch and cron retry.
 */
export async function deliverWebhook(
  endpointId: string,
  url: string,
  secret: string,
  event: string,
  body: string,
  attempt: number,
) {
  const signature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  let statusCode: number | null = null;
  let responseText: string | null = null;
  let success = false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": event,
        "X-Webhook-Attempt": String(attempt),
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    statusCode = res.status;
    responseText = await res.text().catch(() => null);
    success = res.ok;
  } catch (err) {
    responseText = err instanceof Error ? err.message : "Unknown error";
  }

  // Compute retry fields for failed deliveries
  const retryCount = success ? 0 : attempt;
  const nextRetryAt =
    !success && attempt < MAX_RETRIES
      ? new Date(Date.now() + Math.pow(2, attempt) * 1000) // exponential backoff: 2s, 4s, 8s, 16s, 32s
      : null;

  // Log the attempt
  try {
    await prisma.webhookLog.create({
      data: {
        endpointId,
        event,
        payload: JSON.parse(body),
        statusCode,
        response: responseText?.slice(0, 1000) ?? null,
        attempt,
        success,
        retryCount,
        nextRetryAt,
      },
    });
  } catch {
    // non-fatal
  }
}
