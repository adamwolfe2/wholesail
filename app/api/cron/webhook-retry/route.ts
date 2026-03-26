import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deliverWebhook } from "@/lib/webhooks";

const MAX_PER_RUN = 10;
const MAX_RETRIES = 5;

/**
 * GET /api/cron/webhook-retry
 * Runs every 5 minutes via Vercel Cron.
 *
 * Picks up failed webhook deliveries that are due for retry and re-attempts them.
 * On success, marks the log as delivered. On failure, increments retryCount and
 * schedules the next attempt with exponential backoff.
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET env var not set — aborting webhook-retry cron");
    return NextResponse.json({ error: "Cron not configured" }, { status: 503 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];

  try {
    // Find failed webhook logs that are due for retry
    const pendingRetries = await prisma.webhookLog.findMany({
      where: {
        success: false,
        nextRetryAt: { lte: now },
        retryCount: { lt: MAX_RETRIES },
      },
      include: {
        endpoint: {
          select: { id: true, url: true, secret: true, isActive: true },
        },
      },
      orderBy: { nextRetryAt: "asc" },
      take: MAX_PER_RUN,
    });

    if (pendingRetries.length === 0) {
      return NextResponse.json({ processed: 0, succeeded: 0, failed: 0 });
    }

    for (const log of pendingRetries) {
      processed++;

      // Skip if endpoint was deactivated since the original delivery
      if (!log.endpoint.isActive) {
        await prisma.webhookLog.update({
          where: { id: log.id },
          data: { nextRetryAt: null },
        });
        continue;
      }

      const nextAttempt = log.retryCount + 1;
      const body = JSON.stringify(log.payload);

      try {
        await deliverWebhook(
          log.endpoint.id,
          log.endpoint.url,
          log.endpoint.secret,
          log.event,
          body,
          nextAttempt,
        );

        // Mark the original log as superseded (new log was created by deliverWebhook)
        await prisma.webhookLog.update({
          where: { id: log.id },
          data: { nextRetryAt: null },
        });

        succeeded++;
      } catch (err) {
        const errMsg = `Retry failed for log ${log.id}: ${err instanceof Error ? err.message : "unknown"}`;
        errors.push(errMsg);
        console.error("[webhook-retry]", errMsg);

        // Increment retry count and schedule next attempt
        const nextRetryCount = log.retryCount + 1;
        await prisma.webhookLog.update({
          where: { id: log.id },
          data: {
            retryCount: nextRetryCount,
            nextRetryAt:
              nextRetryCount < MAX_RETRIES
                ? new Date(now.getTime() + Math.pow(2, nextRetryCount) * 1000)
                : null,
          },
        });

        failed++;
      }
    }

    console.info(
      `Webhook retry cron: processed=${processed}, succeeded=${succeeded}, failed=${failed}`
    );

    return NextResponse.json({
      processed,
      succeeded,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("Webhook retry cron error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
