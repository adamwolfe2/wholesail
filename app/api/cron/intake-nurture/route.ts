import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  sendIntakeNurtureDay3,
  sendIntakeNurtureDay7,
} from "@/lib/email/notifications";

/**
 * GET /api/cron/intake-nurture
 * Runs daily at 12pm UTC via Vercel Cron.
 *
 * Sends follow-up emails to intake prospects who:
 *   - Have NOT booked a call yet (calBooked = false)
 *   - Have NOT been converted to a project (no project relation)
 *   - Have NOT been archived
 *
 * D3 window: submitted 3–4 days ago → "still interested?" nudge
 * D7 window: submitted 7–8 days ago → final note
 *
 * Dedup via AuditEvent so each email is sent exactly once per intake.
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET env var not set — aborting intake-nurture cron");
    return NextResponse.json({ error: "Cron not configured" }, { status: 503 });
  }
  const secret = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // D3 window: submitted between 4 days ago and 3 days ago
  const d3Start = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  const d3End = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  // D7 window: submitted between 8 days ago and 7 days ago
  const d7Start = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
  const d7End = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let d3Sent = 0;
  let d7Sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  try {
    const [d3Candidates, d7Candidates] = await Promise.all([
      prisma.intakeSubmission.findMany({
        where: {
          calBooked: false,
          archivedAt: null,
          project: null,
          createdAt: { gte: d3Start, lt: d3End },
        },
        select: {
          id: true,
          contactName: true,
          contactEmail: true,
          companyName: true,
        },
      }),
      prisma.intakeSubmission.findMany({
        where: {
          calBooked: false,
          archivedAt: null,
          project: null,
          createdAt: { gte: d7Start, lt: d7End },
        },
        select: {
          id: true,
          contactName: true,
          contactEmail: true,
          companyName: true,
        },
      }),
    ]);

    const allIds = [
      ...d3Candidates.map((i) => i.id),
      ...d7Candidates.map((i) => i.id),
    ];

    // Batch dedup check: fetch all nurture audit events for these intakes in one query
    const sentEvents = await prisma.auditEvent.findMany({
      where: {
        entityType: "IntakeSubmission",
        entityId: { in: allIds },
        action: { in: ["nurture_d3_sent", "nurture_d7_sent"] },
      },
      select: { entityId: true, action: true },
    });

    const sentSet = new Set(sentEvents.map((e) => `${e.entityId}:${e.action}`));

    // ── D3 ──────────────────────────────────────────────────────────────────
    for (const intake of d3Candidates) {
      if (sentSet.has(`${intake.id}:nurture_d3_sent`)) {
        skipped++;
        continue;
      }
      try {
        await sendIntakeNurtureDay3({
          contactName: intake.contactName,
          contactEmail: intake.contactEmail,
          companyName: intake.companyName,
        });
        await prisma.auditEvent.create({
          data: {
            action: "nurture_d3_sent",
            entityType: "IntakeSubmission",
            entityId: intake.id,
            userId: null,
          },
        });
        d3Sent++;
      } catch (err) {
        const msg = `D3 failed for ${intake.id}: ${(err as Error).message}`;
        errors.push(msg);
        console.error("[intake-nurture]", msg);
        await prisma.auditEvent.create({
          data: {
            action: "nurture_d3_error",
            entityType: "IntakeSubmission",
            entityId: intake.id,
            userId: null,
            metadata: { error: (err as Error).message },
          },
        }).catch(() => {});
      }
    }

    // ── D7 ──────────────────────────────────────────────────────────────────
    for (const intake of d7Candidates) {
      if (sentSet.has(`${intake.id}:nurture_d7_sent`)) {
        skipped++;
        continue;
      }
      try {
        await sendIntakeNurtureDay7({
          contactName: intake.contactName,
          contactEmail: intake.contactEmail,
          companyName: intake.companyName,
        });
        await prisma.auditEvent.create({
          data: {
            action: "nurture_d7_sent",
            entityType: "IntakeSubmission",
            entityId: intake.id,
            userId: null,
          },
        });
        d7Sent++;
      } catch (err) {
        const msg = `D7 failed for ${intake.id}: ${(err as Error).message}`;
        errors.push(msg);
        console.error("[intake-nurture]", msg);
        await prisma.auditEvent.create({
          data: {
            action: "nurture_d7_error",
            entityType: "IntakeSubmission",
            entityId: intake.id,
            userId: null,
            metadata: { error: (err as Error).message },
          },
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.error("[intake-nurture] Fatal error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: (err as Error).message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    d3Sent,
    d7Sent,
    skipped,
    errors: errors.length > 0 ? errors : undefined,
  });
}
