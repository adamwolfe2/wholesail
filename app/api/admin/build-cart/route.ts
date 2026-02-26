import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { notifyDistributorsForOrder } from "@/lib/db/orders";

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

async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;
  const last = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  const seq = last
    ? parseInt(last.orderNumber.replace(prefix, ""), 10) + 1
    : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has an allowed role
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!currentUser || !["ADMIN", "SALES_REP", "OPS"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
    const orderNumber = await generateOrderNumber();

    const order = await prisma.order.create({
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
          metadata: { orderNumber, organizationId: data.organizationId },
        },
      });
    } catch {
      // audit failure is non-fatal
    }

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
