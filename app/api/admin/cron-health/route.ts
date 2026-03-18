import { NextResponse } from "next/server";
import { requireAdminOrRep } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";

const KNOWN_CRONS = [
  "onboarding-drip",
  "intake-nurture",
  "lapsed-clients",
  "weekly-report",
  "weekly-digest",
  "abandoned-carts",
  "billing-reminders",
  "low-stock-alerts",
  "partner-nurture",
] as const;

export async function GET() {
  const { error } = await requireAdminOrRep();
  if (error) return error;

  try {
    // Query the most recent AuditEvent per cron job (entityType = 'cron')
    const recentCronEvents = await prisma.auditEvent.findMany({
      where: { entityType: "cron" },
      orderBy: { createdAt: "desc" },
      take: 200, // safety cap — enough to cover all crons with history
    });

    // Build a map of cron name -> latest event
    const latestByCron = new Map<
      string,
      { lastRun: Date; action: string; success: boolean; metadata: unknown }
    >();

    for (const event of recentCronEvents) {
      // entityId is expected to be the cron job name
      const cronName = event.entityId;
      if (!latestByCron.has(cronName)) {
        const meta = event.metadata as Record<string, unknown> | null;
        const success =
          event.action !== "cron_failed" &&
          meta?.error === undefined;
        latestByCron.set(cronName, {
          lastRun: event.createdAt,
          action: event.action,
          success,
          metadata: meta,
        });
      }
    }

    // Build response: known crons with their status
    const jobs = KNOWN_CRONS.map((name) => {
      const data = latestByCron.get(name);
      if (!data) {
        return { name, status: "no_data" as const, lastRun: null };
      }
      return {
        name,
        status: data.success ? ("ok" as const) : ("error" as const),
        lastRun: data.lastRun.toISOString(),
        action: data.action,
        metadata: data.metadata,
      };
    });

    // Also include any cron events not in the known list (discovered dynamically)
    for (const [cronName, data] of latestByCron) {
      if (!KNOWN_CRONS.includes(cronName as (typeof KNOWN_CRONS)[number])) {
        jobs.push({
          name: cronName as (typeof KNOWN_CRONS)[number],
          status: data.success ? ("ok" as const) : ("error" as const),
          lastRun: data.lastRun.toISOString(),
          action: data.action,
          metadata: data.metadata,
        });
      }
    }

    return NextResponse.json({ jobs });
  } catch (err) {
    console.error("Cron health check error:", err);
    return NextResponse.json(
      { error: "Failed to fetch cron health" },
      { status: 500 }
    );
  }
}
