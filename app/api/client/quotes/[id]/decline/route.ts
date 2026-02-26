import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendQuoteDeclinedInternal, sendQuoteResponseToRep } from "@/lib/email";

const bodySchema = z.object({
  reason: z.string().max(500).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const quote = await prisma.quote.findUnique({
      where: { id },
      select: {
        organizationId: true,
        status: true,
        quoteNumber: true,
        repId: true,
        rep: { select: { email: true, name: true } },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (quote.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (quote.status !== "SENT" && quote.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only SENT or DRAFT quotes can be declined" },
        { status: 400 }
      );
    }

    // Parse optional reason
    let reason: string | undefined;
    try {
      const body = await req.json();
      const parsed = bodySchema.safeParse(body);
      if (parsed.success) {
        reason = parsed.data.reason;
      }
    } catch {
      // body is optional
    }

    await prisma.quote.update({
      where: { id },
      data: { status: "DECLINED" },
    });

    // Audit event
    try {
      await prisma.auditEvent.create({
        data: {
          entityType: "Quote",
          entityId: id,
          action: "quote_declined_by_client",
          userId,
          metadata: {
            quoteNumber: quote.quoteNumber,
            ...(reason ? { reason } : {}),
          },
        },
      });
    } catch {
      // non-fatal
    }

    // Notify ops team + assigned rep/account manager — fire-and-forget
    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: {
        name: true,
        accountManager: { select: { email: true, name: true } },
      },
    });
    const orgName = org?.name ?? "Unknown Client";

    sendQuoteDeclinedInternal({
      quoteNumber: quote.quoteNumber,
      quoteId: id,
      orgName,
      reason,
    }).catch(() => {});

    const repsToNotify = new Map<string, { email: string; name: string }>();
    if (quote.rep) repsToNotify.set(quote.rep.email, quote.rep);
    if (org?.accountManager) repsToNotify.set(org.accountManager.email, org.accountManager);
    for (const rep of repsToNotify.values()) {
      sendQuoteResponseToRep({
        quoteNumber: quote.quoteNumber,
        quoteId: id,
        orgName,
        repName: rep.name,
        repEmail: rep.email,
        action: "DECLINED",
        reason,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error declining quote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
