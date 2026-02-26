import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { addDays } from "date-fns";

const generateSchema = z.object({
  orderId: z.string().min(1),
});

/**
 * Generates an invoice number like INV-2026-0001.
 * Sequence is based on invoice count for the current year.
 */
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

/**
 * POST /api/billing/generate
 * Body: { orderId: string }
 *
 * Creates an Invoice record (Net-30) for the given order if one doesn't
 * already exist. Returns the invoice.
 */
export async function POST(req: NextRequest) {
  const { userId, error: authError } = await requireAdmin();
  if (authError) return authError;

  try {

    const body = await req.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { orderId } = parsed.data;

    // Check if invoice already exists
    const existing = await prisma.invoice.findUnique({
      where: { orderId },
    });

    if (existing) {
      return NextResponse.json({ invoice: existing, created: false });
    }

    // Fetch the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        organizationId: true,
        subtotal: true,
        tax: true,
        total: true,
        status: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot generate invoice for a cancelled order" },
        { status: 400 }
      );
    }

    const invoiceNumber = await generateInvoiceNumber();
    const dueDate = addDays(new Date(), 30); // Net-30

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        organizationId: order.organizationId,
        dueDate,
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
          orderId,
          dueDate: dueDate.toISOString(),
          total: Number(order.total),
        },
      },
    });

    return NextResponse.json({ invoice, created: true }, { status: 201 });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Exported helper — call this directly from server code to generate an
 * invoice without going through HTTP. Returns the invoice (existing or new).
 */
export async function generateInvoiceForOrder(
  orderId: string,
  actingUserId?: string
) {
  // Check if invoice already exists
  const existing = await prisma.invoice.findUnique({ where: { orderId } });
  if (existing) return { invoice: existing, created: false };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      organizationId: true,
      subtotal: true,
      tax: true,
      total: true,
      status: true,
    },
  });

  if (!order || order.status === "CANCELLED") return null;

  const invoiceNumber = await generateInvoiceNumber();
  const dueDate = addDays(new Date(), 30);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      orderId: order.id,
      organizationId: order.organizationId,
      dueDate,
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
      userId: actingUserId,
      metadata: {
        invoiceNumber,
        orderId,
        dueDate: dueDate.toISOString(),
        total: Number(order.total),
      },
    },
  });

  return { invoice, created: true };
}
