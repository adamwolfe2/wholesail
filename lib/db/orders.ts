import { prisma } from "./index";
import { Prisma, type OrderStatus } from "@prisma/client";
import { getDiscountForOrg } from "@/lib/pricing";
import {
  isConfigured as blooIsConfigured,
  sendMessage as blooSendMessage,
  orderShippedMessage,
  orderDeliveredMessage,
} from "@/lib/integrations/blooio";
import { sendDistributorOrderNotification } from "@/lib/email";

const FREE_DELIVERY_THRESHOLD = 500;
const STANDARD_DELIVERY_FEE = 25;

// US state-level sales tax rates (representative — swap for TaxJar/Avalara for exact rates)
const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.04,   AK: 0,      AZ: 0.056,  AR: 0.065,  CA: 0.0725, CO: 0.029,
  CT: 0.0635, DE: 0,      FL: 0.06,   GA: 0.04,   HI: 0.04,   ID: 0.06,
  IL: 0.0625, IN: 0.07,   IA: 0.06,   KS: 0.065,  KY: 0.06,   LA: 0.0445,
  ME: 0.055,  MD: 0.06,   MA: 0.0625, MI: 0.06,   MN: 0.06875,MS: 0.07,
  MO: 0.04225,MT: 0,      NE: 0.055,  NV: 0.0685, NH: 0,      NJ: 0.066,
  NM: 0.05125,NY: 0.04,   NC: 0.0475, ND: 0.05,   OH: 0.0575, OK: 0.045,
  OR: 0,      PA: 0.06,   RI: 0.07,   SC: 0.06,   SD: 0.045,  TN: 0.07,
  TX: 0.0625, UT: 0.061,  VT: 0.06,   VA: 0.053,  WA: 0.065,  WV: 0.06,
  WI: 0.05,   WY: 0.04,
};

function getTaxRate(state?: string): number {
  if (!state) return 0;
  return STATE_TAX_RATES[state.trim().toUpperCase()] ?? 0;
}

// Generate order number: ORD-2026-0001.
// Uses MAX existing number + 1 (more robust than COUNT under concurrent inserts).
async function generateOrderNumber(attempt = 0): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;
  const last = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  const lastNum = last ? parseInt(last.orderNumber.replace(prefix, ""), 10) : 0;
  // On retry, add random offset to avoid collision with concurrent requests
  const offset = attempt > 0 ? Math.floor(Math.random() * 100) + attempt : 0;
  return `${prefix}${String(lastNum + 1 + offset).padStart(4, "0")}`;
}

interface CreateOrderInput {
  organizationId: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
  shippingAddressId?: string;
  shippingState?: string; // US state abbreviation (e.g. "CA") for tax calculation
  notes?: string;
  creditApplied?: number; // referral credits to deduct from total
}

export async function createOrder(input: CreateOrderInput) {
  // Apply org-tier discount (catch-all rule) to all items
  const discountPct = await getDiscountForOrg(input.organizationId, "__order__");
  const discountMultiplier = discountPct > 0 ? 1 - discountPct / 100 : 1;

  // Fetch distributor assignment for each product in one query
  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, distributorOrgId: true },
  });
  const productDistributorMap = new Map(
    products.map((p) => [p.id, p.distributorOrgId ?? null])
  );

  const pricedItems = input.items.map((item) => ({
    ...item,
    unitPrice: item.unitPrice * discountMultiplier,
    distributorOrgId: productDistributorMap.get(item.productId) ?? null,
  }));

  const subtotal = pricedItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  // Calculate state-level sales tax on the subtotal
  const taxRate = getTaxRate(input.shippingState);
  const tax = Math.round(subtotal * taxRate * 100) / 100;

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const creditApplied = Math.min(input.creditApplied ?? 0, subtotal + tax + deliveryFee);
  const total = subtotal + tax + deliveryFee - creditApplied;

  // Retry up to 10 times on unique constraint collision (concurrent order creation)
  type OrderResult = Prisma.OrderGetPayload<{
    include: {
      items: true;
      organization: { select: { name: true; email: true } };
      shippingAddress: { select: { street: true; city: true; state: true; zip: true } };
    };
  }>;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let order!: OrderResult;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let orderNumber!: string;
  for (let attempt = 0; attempt < 10; attempt++) {
    orderNumber = await generateOrderNumber(attempt);
    try {
      order = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            orderNumber,
            organizationId: input.organizationId,
            userId: input.userId,
            subtotal,
            tax,
            deliveryFee,
            creditApplied,
            total,
            shippingAddressId: input.shippingAddressId,
            notes: input.notes,
            items: {
              create: pricedItems.map((item) => ({
                productId: item.productId,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.unitPrice * item.quantity,
                distributorOrgId: item.distributorOrgId,
              })),
            },
          },
          include: {
            items: true,
            organization: { select: { name: true, email: true } },
            shippingAddress: { select: { street: true, city: true, state: true, zip: true } },
          },
        });

        // Reserve inventory (inside transaction — prevents overselling)
        for (const item of pricedItems) {
          await tx.inventoryLevel.updateMany({
            where: {
              productId: item.productId,
              quantityOnHand: { gte: item.quantity }, // only if sufficient stock
            },
            data: {
              quantityOnHand: { decrement: item.quantity },
              quantityReserved: { increment: item.quantity },
            },
          });
          // Note: if updateMany matches 0 rows (no inventory record or insufficient stock),
          // the order still proceeds — inventory tracking is best-effort for products
          // that don't have InventoryLevel records yet.
        }

        // Audit event (inside transaction)
        await tx.auditEvent.create({
          data: {
            entityType: "Order",
            entityId: created.id,
            action: "created",
            userId: input.userId,
            metadata: {
              orderNumber,
              total,
              discountPct: discountPct > 0 ? discountPct : undefined,
              taxRate: taxRate > 0 ? taxRate : undefined,
              creditApplied: creditApplied > 0 ? creditApplied : undefined,
            },
          },
        });

        return created;
      });
      break;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002" &&
        attempt < 9
      ) {
        continue;
      }
      throw err;
    }
  }

  // Notify each distributor about their items (fire-and-forget)
  const distributorIds = [...new Set(
    order.items.map((i) => i.distributorOrgId).filter(Boolean) as string[]
  )];

  if (distributorIds.length > 0) {
    const distributors = await prisma.organization.findMany({
      where: { id: { in: distributorIds }, isDistributor: true },
      select: { id: true, name: true, email: true, distributorCcEmail: true },
    });

    const clientOrg = order.organization;
    const addr = order.shippingAddress;
    const deliveryAddress = addr
      ? `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`
      : null;

    for (const dist of distributors) {
      const theirItems = order.items
        .filter((i) => i.distributorOrgId === dist.id)
        .map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          total: Number(i.total),
        }));
      const itemsTotal = theirItems.reduce((s, i) => s + i.total, 0);

      sendDistributorOrderNotification({
        distributorName: dist.name,
        distributorEmail: dist.email,
        distributorCcEmail: dist.distributorCcEmail,
        orderNumber: order.orderNumber,
        orderId: order.id,
        clientName: clientOrg.name,
        clientEmail: clientOrg.email,
        deliveryAddress,
        items: theirItems,
        itemsTotal,
      }).catch((err) => console.error(`Distributor email error for ${dist.id}:`, err));
    }
  }

  return order;
}

// Fire-and-forget distributor notifications for any order that has distributor-assigned items.
// Call this after prisma.order.create() in routes that bypass createOrder().
export async function notifyDistributorsForOrder({
  orderId,
  orderNumber,
  clientName,
  clientEmail,
  deliveryAddress,
}: {
  orderId: string;
  orderNumber: string;
  clientName: string;
  clientEmail: string | null;
  deliveryAddress: string | null;
}): Promise<void> {
  try {
    const items = await prisma.orderItem.findMany({
      where: { orderId, distributorOrgId: { not: null } },
      select: { distributorOrgId: true, name: true, quantity: true, unitPrice: true, total: true },
    });
    const distributorIds = [...new Set(items.map((i) => i.distributorOrgId as string))];
    if (distributorIds.length === 0) return;

    const distributors = await prisma.organization.findMany({
      where: { id: { in: distributorIds }, isDistributor: true },
      select: { id: true, name: true, email: true, distributorCcEmail: true },
    });

    for (const dist of distributors) {
      const theirItems = items
        .filter((i) => i.distributorOrgId === dist.id)
        .map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          total: Number(i.total),
        }));
      const itemsTotal = theirItems.reduce((s, i) => s + i.total, 0);
      sendDistributorOrderNotification({
        distributorName: dist.name,
        distributorEmail: dist.email,
        distributorCcEmail: dist.distributorCcEmail,
        orderNumber,
        orderId,
        clientName,
        clientEmail,
        deliveryAddress,
        items: theirItems,
        itemsTotal,
      }).catch((err) => console.error(`Distributor email error for ${dist.id}:`, err));
    }
  } catch (err) {
    console.error("notifyDistributorsForOrder error:", err);
  }
}

export async function getOrdersByOrganization(organizationId: string) {
  return prisma.order.findMany({
    where: { organizationId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: { include: { product: true } },
      payments: true,
      organization: {
        select: { id: true, name: true, email: true, phone: true, contactPerson: true, tier: true },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
      shipment: {
        include: {
          events: { orderBy: { timestamp: "desc" } },
        },
      },
    },
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  userId?: string
) {
  const now = new Date();
  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === "CONFIRMED" ? { paidAt: now } : {}),
        ...(status === "PACKED" ? { packedAt: now } : {}),
        ...(status === "SHIPPED" ? { shippedAt: now } : {}),
      },
    });

    await tx.auditEvent.create({
      data: {
        entityType: "Order",
        entityId: orderId,
        action: "status_changed",
        userId,
        metadata: { newStatus: status },
      },
    });

    return updated;
  });

  // Fire Bloo.io iMessage for key delivery milestones (fire-and-forget)
  if ((status === "SHIPPED" || status === "DELIVERED") && blooIsConfigured()) {
    prisma.order
      .findUnique({
        where: { id: orderId },
        select: {
          orderNumber: true,
          organization: { select: { phone: true, name: true } },
        },
      })
      .then((full) => {
        if (!full?.organization?.phone) return;
        const msg =
          status === "SHIPPED"
            ? orderShippedMessage(full.orderNumber, full.organization.name)
            : orderDeliveredMessage(full.orderNumber, full.organization.name);
        return blooSendMessage({
          to: full.organization.phone,
          message: msg,
        });
      })
      .catch((err) => console.error("Bloo.io send (status update) error:", err));
  }

  return order;
}

export async function updateOrderStripeIds(
  orderId: string,
  data: { stripeSessionId?: string; stripePaymentIntentId?: string }
) {
  return prisma.order.update({
    where: { id: orderId },
    data,
  });
}

export async function getRecentOrders(limit = 10) {
  return prisma.order.findMany({
    include: { items: true, organization: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
