import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { sendQuoteToClientEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, error: authError } = await requireAdmin();
  if (authError) return authError;

  void req;

  try {
    const { id } = await params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        organization: {
          select: { name: true, email: true, contactPerson: true },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (quote.status !== "DRAFT" && quote.status !== "SENT") {
      return NextResponse.json(
        { error: "Only DRAFT or SENT quotes can be sent to the client" },
        { status: 400 },
      );
    }

    if (!quote.organization.email) {
      return NextResponse.json(
        { error: "Client organization has no email address" },
        { status: 400 },
      );
    }

    // Update status to SENT and set sentAt
    const updated = await prisma.quote.update({
      where: { id },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    // Send email
    await sendQuoteToClientEmail({
      quoteNumber: quote.quoteNumber,
      quoteId: id,
      clientName: quote.organization.contactPerson || quote.organization.name,
      clientEmail: quote.organization.email,
      total: Number(quote.total),
      expiresAt: quote.expiresAt,
      notes: quote.notes,
    });

    // Audit log
    try {
      await prisma.auditEvent.create({
        data: {
          entityType: "Quote",
          entityId: id,
          action: "quote_sent_to_client",
          userId,
          metadata: {
            quoteNumber: quote.quoteNumber,
            sentTo: quote.organization.email,
          },
        },
      });
    } catch {
      // non-fatal
    }

    return NextResponse.json({ quote: updated });
  } catch (error) {
    console.error("Error sending quote:", error);
    return NextResponse.json(
      { error: "Failed to send quote" },
      { status: 500 },
    );
  }
}
