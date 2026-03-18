import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { notifyDistributorsForOrder } from "@/lib/db/orders";
import { dispatchWebhook } from "@/lib/webhooks";
import { createOrderWithRetry } from "@/lib/order-number";
import { requireAdminOrRep } from "@/lib/auth/require-admin";

const buildCartSchema = z.object({
  organizationId: z.string().min(1),
  repId: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  notes: z.string().optional(),
  repNote: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId, error: authError } = await requireAdminOrRep();
    if (authError) return authError;

    const body = await req.json();
    const parsed = buildCartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid order data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Find the organization and its first member user
    const org = await prisma.organization.findUnique({
      where: { id: data.organizationId },
      include: {
        members: { take: 1, select: { id: true } },
      },
    });

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (org.members.length === 0) {
      return NextResponse.json(
        { error: "Organization has no members. Cannot place order." },
        { status: 422 }
      );
    }

    const clientUserId = org.members[0].id;

    // Fetch products for pricing
    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, distributorOrgId: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Build order items
    const orderItems = data.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      const unitPrice = Number(product.price);
      return {
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        unitPrice,
        total: unitPrice * item.quantity,
        distributorOrgId: product.distributorOrgId ?? null,
      };
    });

    const subtotal = orderItems.reduce((acc, i) => acc + i.total, 0);

    const order = await createOrderWithRetry(async (orderNumber) => {
      return prisma.order.create({
        data: {
          orderNumber,
          organizationId: data.organizationId,
          userId: clientUserId,
          placedByRepId: userId,
          status: "PENDING",
          subtotal,
          tax: 0,
          deliveryFee: 0,
          total: subtotal,
          notes: [data.notes, data.repNote ? `[Rep Note] ${data.repNote}` : null]
            .filter(Boolean)
            .join("\n\n") || null,
          items: {
            create: orderItems,
          },
        },
      });
    });

    notifyDistributorsForOrder({
      orderId: order.id,
      orderNumber: order.orderNumber,
      clientName: org.name,
      clientEmail: org.email ?? null,
      deliveryAddress: null,
    }).catch(() => {});

    // Write audit event
    try {
      await prisma.auditEvent.create({
        data: {
          entityType: "Order",
          entityId: order.id,
          action: "created_by_rep",
          userId,
          metadata: { orderNumber: order.orderNumber, organizationId: data.organizationId },
        },
      });
    } catch {
      // audit failure is non-fatal
    }

    dispatchWebhook("order.created", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      organizationId: data.organizationId,
      total: subtotal,
    }).catch(() => {});

    return NextResponse.json(
      { orderId: order.id, orderNumber: order.orderNumber },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in build-cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
