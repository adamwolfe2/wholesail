import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPartnerDay3Email, sendPartnerDay7Email } from "@/lib/email";

// Onboarding drip — runs daily at 10am via Vercel Cron.
// Step 1 (set at approval): Day 0 welcome email already sent by the wholesale approval route.
// Step 2 trigger: 1+ day after approvedAt → send Day 1 "catalog guide" email.
// Step 3 trigger: 3+ days after approvedAt + no orders placed → send Day 7 nudge.
// Step 4: done — no more onboarding emails.

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
  let day7Sent = 0;

  // Step 1 → 2: orgs that got Day 0 welcome but not Day 1 yet, and it's been 1+ days
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
      console.error(`Onboarding Day 1 email failed for org ${org.id}:`, err);
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

  // Step 2 → 3: orgs that got Day 1 but not Day 7 nudge, 3+ days old, no orders placed
  const day3Targets = await prisma.organization.findMany({
    where: {
      onboardingStep: 2,
      approvedAt: { lte: day3Cutoff },
      // Skip if they've placed an order
      orders: { none: { status: { not: "CANCELLED" } } },
    },
    select: { id: true, email: true, contactPerson: true, name: true },
  });

  for (const org of day3Targets) {
    try {
      await sendPartnerDay7Email({
        name: org.contactPerson,
        email: org.email,
        businessName: org.name,
      });
      await prisma.organization.update({
        where: { id: org.id },
        data: { onboardingStep: 3 },
      });
      day7Sent++;
    } catch (err) {
      console.error(`Onboarding Day 3 nudge failed for org ${org.id}:`, err);
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

  // Step 3 → 4: orgs at step 3 that are 7+ days old — mark done regardless
  await prisma.organization.updateMany({
    where: {
      onboardingStep: 3,
      approvedAt: { lte: day7Cutoff },
    },
    data: { onboardingStep: 4 },
  });

  return NextResponse.json({
    success: true,
    day1Sent,
    day7Sent,
  });
}
