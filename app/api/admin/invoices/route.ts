import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createInvoiceSchema = z.object({
  orderId: z.string().min(1),
  dueDate: z.string().min(1), // ISO date string
});

// Generate invoice number: INV-2026-0001
// Uses MAX existing number + 1 (more robust than COUNT under concurrent inserts).
async function generateInvoiceNumber(attempt = 0): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const last = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });
  const lastNum = last ? parseInt(last.invoiceNumber.replace(prefix, ""), 10) : 0;
  const offset = attempt > 0 ? Math.floor(Math.random() * 100) + attempt : 0;
  return `${prefix}${String(lastNum + 1 + offset).padStart(4, "0")}`;
}

export async function POST(req: NextRequest) {
  const { userId, error: authError } = await requireAdmin();
  if (authError) return authError;

  try {

    const body = await req.json();
    const parsed = createInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if order exists and doesn't already have an invoice
    const order = await prisma.order.findUnique({
      where: { id: parsed.data.orderId },
      include: { invoice: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.invoice) {
      return NextResponse.json(
        { error: "This order already has an invoice" },
        { status: 409 }
      );
    }

    // Retry up to 10 times on unique constraint collision
    let invoice;
    let invoiceNumber = "";
    for (let attempt = 0; attempt < 10; attempt++) {
      invoiceNumber = await generateInvoiceNumber(attempt);
      try {
        invoice = await prisma.invoice.create({
          data: {
            invoiceNumber,
            orderId: order.id,
            organizationId: order.organizationId,
            dueDate: new Date(parsed.data.dueDate),
            status: "PENDING",
            subtotal: order.subtotal,
            tax: order.tax,
            total: order.total,
          },
        });
        break;
      } catch (err) {
        if ((err as { code?: string }).code === "P2002" && attempt < 9) continue;
        throw err;
      }
    }

    if (!invoice) {
      return NextResponse.json({ error: "Failed to generate unique invoice number" }, { status: 500 });
    }

    await prisma.auditEvent.create({
      data: {
        entityType: "Invoice",
        entityId: invoice.id,
        action: "created",
        userId,
        metadata: {
          invoiceNumber,
          orderId: order.id,
          orderNumber: order.orderNumber,
          total: Number(order.total),
        },
      },
    });

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  try {

    const invoices = await prisma.invoice.findMany({
      include: {
        order: {
          select: {
            orderNumber: true,
            items: { select: { name: true, quantity: true, unitPrice: true, total: true } },
          },
        },
        organization: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
