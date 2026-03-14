import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { dispatchWebhook } from "@/lib/webhooks";
import { addDays } from "date-fns";

const generateSchema = z.object({
  orderId: z.string().min(1),
});

/**
 * Generates an invoice number like INV-2026-0001.
 * Offset is passed in so callers can retry on P2002 unique collisions.
 */
async function generateInvoiceNumber(offset = 0): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      },
    },
  });
  return `INV-${year}-${String(count + 1 + offset).padStart(4, "0")}`;
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

    const dueDate = addDays(new Date(), 30); // Net-30

    // Retry up to 5 times on unique constraint collision (concurrent invoice creation)
    let invoice;
    for (let attempt = 0; attempt < 5; attempt++) {
      const invoiceNumber = await generateInvoiceNumber(attempt);
      try {
        invoice = await prisma.invoice.create({
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
        break;
      } catch (createErr) {
        if (
          createErr instanceof Prisma.PrismaClientKnownRequestError &&
          createErr.code === "P2002" &&
          attempt < 4
        ) {
          continue; // retry with next offset
        }
        throw createErr;
      }
    }

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

  const dueDate = addDays(new Date(), 30);

  // Retry up to 5 times on unique constraint collision (concurrent invoice creation)
  for (let attempt = 0; attempt < 5; attempt++) {
    const invoiceNumber = await generateInvoiceNumber(attempt);
    try {
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
      dispatchWebhook("invoice.created", {
        invoiceId: invoice.id,
        invoiceNumber,
        orderId,
        organizationId: order.organizationId,
        total: Number(order.total),
        dueDate: dueDate.toISOString(),
      }).catch(() => {});

      return { invoice, created: true };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002" &&
        attempt < 4
      ) {
        continue; // retry with next offset
      }
      throw err;
    }
  }

  return null; // unreachable, but satisfies TS
}
