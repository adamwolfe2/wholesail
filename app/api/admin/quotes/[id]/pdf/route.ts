import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrRep } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuotePDF } from "@/lib/pdf/quote-pdf";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error: authError } = await requireAdminOrRep();
  if (authError) return authError;

  void req;

  try {
    const { id } = await params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        items: true,
        organization: {
          select: { name: true, email: true, contactPerson: true },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const items = quote.items.map((item) => ({
      description: item.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
    }));

    const pdfBuffer = await renderToBuffer(
      QuotePDF({
        quoteNumber: quote.quoteNumber,
        status: quote.status,
        createdAt: quote.createdAt.toISOString(),
        expiresAt: quote.expiresAt?.toISOString() ?? null,
        clientName: quote.organization.name,
        clientEmail: quote.organization.email,
        items,
        subtotal: Number(quote.subtotal),
        discount: Number(quote.discount),
        total: Number(quote.total),
        notes: quote.notes,
      }),
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${quote.quoteNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating quote PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
