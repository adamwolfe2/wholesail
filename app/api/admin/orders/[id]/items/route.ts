import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";

const itemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

const editItemsSchema = z.object({
  items: z.array(itemSchema).min(1),
});

const EDITABLE_STATUSES = ["PENDING", "CONFIRMED"] as const;

/**
 * PATCH /api/admin/orders/[id]/items
 * Replace order line items (only for PENDING/CONFIRMED orders).
 * Recalculates subtotal/tax/total and adjusts inventory reservations.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId, error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = editItemsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Fetch existing order with items
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!(EDITABLE_STATUSES as readonly string[]).includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot edit items on ${order.status} orders. Only PENDING and CONFIRMED orders can be modified.` },
        { status: 400 },
      );
    }

    // Check invoice doesn't already exist
    const existingInvoice = await prisma.invoice.findUnique({
      where: { orderId: id },
    });
    if (existingInvoice) {
      return NextResponse.json(
        { error: "Cannot edit items — invoice already exists for this order" },
        { status: 400 },
      );
    }

    // Fetch product prices for new items
    const productIds = parsed.data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, distributorOrgId: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate all products exist
    for (const item of parsed.data.items) {
      if (!productMap.has(item.productId)) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 },
        );
      }
    }

    // Build new items with prices
    const newItems = parsed.data.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = Number(product.price);
      const total = unitPrice * item.quantity;
      return {
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        unitPrice,
        total,
        distributorOrgId: product.distributorOrgId,
      };
    });

    const newSubtotal = newItems.reduce((sum, i) => sum + i.total, 0);
    // Preserve same tax rate
    const oldTaxRate = Number(order.subtotal) > 0
      ? Number(order.tax) / Number(order.subtotal)
      : 0;
    const newTax = Math.round(newSubtotal * oldTaxRate * 100) / 100;
    const newTotal = newSubtotal + newTax;

    // Transaction: release old reservations, delete old items, create new items, update order totals, reserve new
    await prisma.$transaction(async (tx) => {
      // Release old inventory reservations
      for (const oldItem of order.items) {
        await tx.inventoryLevel.updateMany({
          where: { productId: oldItem.productId },
          data: { quantityReserved: { decrement: oldItem.quantity } },
        });
      }

      // Delete old items
      await tx.orderItem.deleteMany({ where: { orderId: id } });

      // Create new items
      await tx.orderItem.createMany({
        data: newItems.map((item) => ({
          orderId: id,
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          distributorOrgId: item.distributorOrgId,
        })),
      });

      // Update order totals
      await tx.order.update({
        where: { id },
        data: {
          subtotal: newSubtotal,
          tax: newTax,
          total: newTotal,
        },
      });

      // Reserve new inventory
      for (const item of newItems) {
        await tx.inventoryLevel.updateMany({
          where: { productId: item.productId },
          data: { quantityReserved: { increment: item.quantity } },
        });
      }

      // Audit log
      await tx.auditEvent.create({
        data: {
          entityType: "Order",
          entityId: id,
          action: "items_edited",
          userId,
          metadata: {
            oldItemCount: order.items.length,
            newItemCount: newItems.length,
            oldTotal: Number(order.total),
            newTotal,
          },
        },
      });
    });

    // Fetch updated order
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Error editing order items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
