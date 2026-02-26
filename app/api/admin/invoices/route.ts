import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createInvoiceSchema = z.object({
  orderId: z.string().min(1),
  dueDate: z.string().min(1), // ISO date string
});

// Generate invoice number: INV-2026-0001
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });
  return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
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

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
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
