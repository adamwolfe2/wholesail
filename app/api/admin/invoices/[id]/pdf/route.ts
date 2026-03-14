import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrRep } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/lib/pdf/invoice-pdf";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error: authError } = await requireAdminOrRep();
  if (authError) return authError;

  void req;

  try {
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: true,
            organization: {
              select: { name: true, email: true, contactPerson: true },
            },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const items = invoice.order.items.map((item) => ({
      description: item.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
    }));

    const pdfBuffer = await renderToBuffer(
      InvoicePDF({
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        issuedAt: invoice.createdAt.toISOString(),
        dueAt: invoice.dueDate.toISOString(),
        paidAt: invoice.paidAt?.toISOString() ?? null,
        clientName: invoice.order.organization.name,
        clientEmail: invoice.order.organization.email,
        items,
        subtotal: Number(invoice.subtotal),
        tax: Number(invoice.tax),
        total: Number(invoice.total),
      }),
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
