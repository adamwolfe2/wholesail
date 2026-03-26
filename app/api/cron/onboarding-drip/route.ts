import { NextResponse } from "next/server";
import { captureWithContext } from "@/lib/sentry";
import { prisma } from "@/lib/db";
import {
  sendPartnerDay3Email,
  sendPartnerDay3StandingOrdersEmail,
  sendPartnerDay7Email,
  sendPartnerDay7AnalyticsEmail,
} from "@/lib/email";

/**
 * Onboarding drip -- runs daily at 10am via Vercel Cron.
 *
 * Step 0 (at approval): Welcome email already sent by the wholesale approval route.
 * Step 1 -> 2: 1+ day after approval  -> Day 1: "Before your first order" (catalog guide)
 * Step 2 -> 3: 3+ days after approval -> Day 3: "Standing orders" (auto-reorder setup)
 * Step 3 -> 4: 7+ days after approval -> Day 7: "Analytics dashboard" (track spending)
 *              OR if they still haven't ordered, send the "What are you running low on?" nudge
 * Step 4: done -- no more onboarding emails.
 */

export async function GET(req: Request) {
  // Fail-secure: abort if CRON_SECRET is not configured
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET env var is not set — aborting cron to prevent open access");
    return NextResponse.json({ error: "Cron not configured" }, { status: 503 });
  }
  const secret = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const day1Cutoff = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const day3Cutoff = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const day7Cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let day1Sent = 0;
  let day3Sent = 0;
  let day7Sent = 0;

  // ── Step 1 -> 2: Day 1 catalog guide ────────────────────────────────────────
  const day1Targets = await prisma.organization.findMany({
    where: {
      onboardingStep: 1,
      approvedAt: { lte: day1Cutoff },
    },
    select: { id: true, email: true, contactPerson: true, name: true },
  });

  for (const org of day1Targets) {
    try {
      await sendPartnerDay3Email({
        name: org.contactPerson,
        email: org.email,
        businessName: org.name,
      });
      await prisma.organization.update({
        where: { id: org.id },
        data: { onboardingStep: 2 },
      });
      day1Sent++;
    } catch (err) {
      captureWithContext(err, { route: "cron/onboarding-drip", step: "day1", orgId: org.id });
      await prisma.auditEvent.create({
        data: {
          action: "onboarding_drip_failed",
          entityType: "Organization",
          entityId: org.id,
          metadata: { step: 1, error: String(err) },
        },
      }).catch(() => {});
    }
  }

  // ── Step 2 -> 3: Day 3 standing orders guide ────────────────────────────────
  const day3Targets = await prisma.organization.findMany({
    where: {
      onboardingStep: 2,
      approvedAt: { lte: day3Cutoff },
    },
    select: { id: true, email: true, contactPerson: true, name: true },
  });

  for (const org of day3Targets) {
    try {
      await sendPartnerDay3StandingOrdersEmail({
        name: org.contactPerson,
        email: org.email,
        businessName: org.name,
      });
      await prisma.organization.update({
        where: { id: org.id },
        data: { onboardingStep: 3 },
      });
      day3Sent++;
    } catch (err) {
      captureWithContext(err, { route: "cron/onboarding-drip", step: "day3", orgId: org.id });
      await prisma.auditEvent.create({
        data: {
          action: "onboarding_drip_failed",
          entityType: "Organization",
          entityId: org.id,
          metadata: { step: 3, error: String(err) },
        },
      }).catch(() => {});
    }
  }

  // ── Step 3 -> 4: Day 7 analytics + final nudge ─────────────────────────────
  const day7Targets = await prisma.organization.findMany({
    where: {
      onboardingStep: 3,
      approvedAt: { lte: day7Cutoff },
    },
    select: {
      id: true,
      email: true,
      contactPerson: true,
      name: true,
      orders: {
        where: { status: { not: "CANCELLED" } },
        select: { id: true },
        take: 1,
      },
    },
  });

  for (const org of day7Targets) {
    try {
      const hasOrders = org.orders.length > 0;

      if (hasOrders) {
        // They've ordered -- send analytics guide
        await sendPartnerDay7AnalyticsEmail({
          name: org.contactPerson,
          email: org.email,
          businessName: org.name,
        });
      } else {
        // No orders yet -- send nudge + analytics
        await sendPartnerDay7Email({
          name: org.contactPerson,
          email: org.email,
          businessName: org.name,
        });
      }

      await prisma.organization.update({
        where: { id: org.id },
        data: { onboardingStep: 4 },
      });
      day7Sent++;
    } catch (err) {
      captureWithContext(err, { route: "cron/onboarding-drip", step: "day7", orgId: org.id });
      await prisma.auditEvent.create({
        data: {
          action: "onboarding_drip_failed",
          entityType: "Organization",
          entityId: org.id,
          metadata: { step: 7, error: String(err) },
        },
      }).catch(() => {});
    }
  }

  return NextResponse.json({
    success: true,
    day1Sent,
    day3Sent,
    day7Sent,
  });
}
