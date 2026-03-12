import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { sendDropAlertEmail } from "@/lib/email";
import { notifyLimiter, checkRateLimit } from "@/lib/rate-limit";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdmin();
  if (error) return error;

  const { allowed } = await checkRateLimit(notifyLimiter, userId)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { id } = await params;

  const drop = await prisma.productDrop.findUnique({
    where: { id },
    include: { alerts: { select: { email: true } } },
  });

  if (!drop) {
    return NextResponse.json({ error: "Drop not found" }, { status: 404 });
  }

  const emails = drop.alerts.map((a) => a.email);

  if (emails.length === 0) {
    return NextResponse.json({ sent: 0, total: 0, message: "No subscribers to notify" });
  }

  const errors: string[] = [];

  // Send emails in parallel batches of 10 to avoid overwhelming Resend
  const BATCH_SIZE = 10;
  const results: boolean[] = [];

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map((email) =>
        sendDropAlertEmail({
          email,
          dropTitle: drop.title,
          dropDate: drop.dropDate.toISOString(),
          description: drop.description,
          category: drop.category,
        })
      )
    );
    for (let j = 0; j < batchResults.length; j++) {
      const r = batchResults[j];
      if (r.status === "fulfilled" && r.value.success) {
        results.push(true);
      } else {
        results.push(false);
        errors.push(batch[j]);
      }
    }
  }

  const sent = results.filter(Boolean).length;

  await prisma.auditEvent.create({
    data: {
      entityType: "ProductDrop",
      entityId: id,
      action: "alert_blast_sent",
      metadata: { sent, total: emails.length, dropTitle: drop.title },
    },
  });

  return NextResponse.json({ sent, total: emails.length, errors });
}
