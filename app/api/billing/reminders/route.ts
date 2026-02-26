import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendInvoiceEmail } from "@/lib/email";
import { format, addDays, isPast, differenceInDays } from "date-fns";

/**
 * GET /api/billing/reminders
 *
 * Cron job endpoint — send payment reminders for:
 *   - Invoices due within 5 days  (Day 25 reminder)
 *   - Invoices that are overdue   (past due notice)
 *
 * Re-sends at most once every 7 days (based on reminderSentAt).
 *
 * Expects a CRON_SECRET header to prevent unauthenticated access.
 */
export async function GET(req: Request) {
  // Shared-secret guard for cron calls — fail secure when key not set.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "Cron secret not configured" },
      { status: 503 }
    );
  }

  // Accept either Vercel's Authorization: Bearer {CRON_SECRET} format
  // or the legacy x-cron-secret header for self-hosted cron schedulers
  const authHeader = req.headers instanceof Headers
    ? req.headers.get("authorization")
    : null;
  const legacyHeader = req.headers instanceof Headers
    ? req.headers.get("x-cron-secret")
    : null;

  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const isAuthorized = bearerToken === cronSecret || legacyHeader === cronSecret;

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const fiveDaysFromNow = addDays(now, 5);
  const sevenDaysAgo = addDays(now, -7);

  let sent = 0;
  let skipped = 0;

  try {
    // Find all PENDING or OVERDUE invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        status: { in: ["PENDING", "OVERDUE"] },
      },
      include: {
        organization: {
          select: { name: true, email: true, contactPerson: true },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    for (const invoice of invoices) {
      const dueDate = new Date(invoice.dueDate);
      const isOverdue = isPast(dueDate);
      const daysUntilDue = differenceInDays(dueDate, now);
      const isDueSoon = !isOverdue && daysUntilDue <= 5;

      if (!isOverdue && !isDueSoon) {
        skipped++;
        continue;
      }

      // Check if we've already sent a reminder recently
      if (invoice.reminderSentAt) {
        const lastSent = new Date(invoice.reminderSentAt);
        if (lastSent > sevenDaysAgo) {
          skipped++;
          continue;
        }
      }

      const subjectPrefix = isOverdue
        ? `OVERDUE — Invoice ${invoice.invoiceNumber}`
        : `Payment Due Soon — Invoice ${invoice.invoiceNumber}`;

      const dueDateStr = format(dueDate, "MMMM d, yyyy");

      // Send via Resend
      const emailResult = await sendInvoiceEmail({
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.organization.contactPerson,
        customerEmail: invoice.organization.email,
        total: Number(invoice.total),
        dueDate: isOverdue
          ? `${dueDateStr} (OVERDUE)`
          : `${dueDateStr} (due in ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""})`,
      });

      if (emailResult.success) {
        // Update reminderSentAt and flip status to OVERDUE if past due
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            reminderSentAt: now,
            ...(isOverdue && invoice.status !== "OVERDUE"
              ? { status: "OVERDUE" }
              : {}),
          },
        });

        await prisma.auditEvent.create({
          data: {
            entityType: "Invoice",
            entityId: invoice.id,
            action: isOverdue ? "overdue_reminder_sent" : "payment_reminder_sent",
            metadata: {
              invoiceNumber: invoice.invoiceNumber,
              dueDate: dueDateStr,
              isOverdue,
            },
          },
        });

        sent++;
      } else {
        skipped++;
      }
    }

    return NextResponse.json({ sent, skipped });
  } catch (error) {
    console.error("Billing reminders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
