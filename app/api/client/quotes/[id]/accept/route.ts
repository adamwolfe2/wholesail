import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { sendQuoteResponseToRep } from "@/lib/email";
import { notifyDistributorsForOrder } from "@/lib/db/orders";
import { createOrderWithRetry } from "@/lib/order-number";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        items: true,
        rep: { select: { email: true, name: true } },
        organization: {
          include: {
            members: { take: 1, select: { id: true } },
            accountManager: { select: { email: true, name: true } },
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (quote.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (quote.status !== "SENT" && quote.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only SENT or DRAFT quotes can be accepted" },
        { status: 400 }
      );
    }

    // Early check outside transaction (non-authoritative, avoids unnecessary work)
    if (quote.convertedOrderId) {
      return NextResponse.json(
        { error: "Quote already converted to an order" },
        { status: 409 }
      );
    }

    // Get the org's default shipping address
    const address = await prisma.address.findFirst({
      where: {
        organizationId: quote.organizationId,
        isDefault: true,
      },
    });

    // Fetch distributor assignment for each product
    const acceptProductIds = quote.items.map((i) => i.productId);
    const acceptProducts = await prisma.product.findMany({
      where: { id: { in: acceptProductIds } },
      select: { id: true, distributorOrgId: true },
    });
    const acceptDistributorMap = new Map(acceptProducts.map((p) => [p.id, p.distributorOrgId ?? null]));

    // Use a serializable transaction to prevent duplicate order creation.
    // The authoritative convertedOrderId check is INSIDE the transaction so
    // two concurrent requests cannot both pass it.
    const order = await prisma.$transaction(async (tx) => {
      // Re-read the quote inside the transaction to get a consistent snapshot
      const freshQuote = await tx.quote.findUnique({
        where: { id },
        select: { convertedOrderId: true },
      });

      if (freshQuote?.convertedOrderId) {
        throw new Error("QUOTE_ALREADY_CONVERTED");
      }

      // Create order from quote with retry on duplicate order number
      const newOrder = await createOrderWithRetry(async (orderNumber) => {
        return tx.order.create({
          data: {
            orderNumber,
            organizationId: quote.organizationId,
            userId,
            placedByRepId: quote.repId ?? undefined,
            status: "PENDING",
            subtotal: quote.subtotal,
            tax: 0,
            deliveryFee: 0,
            total: quote.total,
            shippingAddressId: address?.id,
            notes: `Created from quote ${quote.quoteNumber}`,
            items: {
              create: quote.items.map((item) => ({
                productId: item.productId,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total,
                distributorOrgId: acceptDistributorMap.get(item.productId) ?? null,
              })),
            },
          },
        });
      });

      // Update quote: accepted + linked to order (inside same transaction)
      await tx.quote.update({
        where: { id },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
          convertedOrderId: newOrder.id,
        },
      });

      return newOrder;
    }, {
      isolationLevel: "Serializable",
    });

    // Fire-and-forget side effects AFTER the transaction commits
    notifyDistributorsForOrder({
      orderId: order.id,
      orderNumber: order.orderNumber,
      clientName: quote.organization.name,
      clientEmail: null,
      deliveryAddress: null,
    }).catch(() => {});

    // Audit event
    try {
      await prisma.auditEvent.create({
        data: {
          entityType: "Quote",
          entityId: id,
          action: "quote_accepted_by_client",
          userId,
          metadata: {
            quoteNumber: quote.quoteNumber,
            orderId: order.id,
            orderNumber: order.orderNumber,
          },
        },
      });
    } catch {
      // non-fatal
    }

    // Notify the assigned rep and/or account manager — fire-and-forget
    const repsToNotify = new Map<string, { email: string; name: string }>();
    if (quote.rep) repsToNotify.set(quote.rep.email, quote.rep);
    if (quote.organization.accountManager) {
      const am = quote.organization.accountManager;
      repsToNotify.set(am.email, am);
    }
    for (const rep of repsToNotify.values()) {
      sendQuoteResponseToRep({
        quoteNumber: quote.quoteNumber,
        quoteId: id,
        orgName: quote.organization.name,
        repName: rep.name,
        repEmail: rep.email,
        action: "ACCEPTED",
        orderNumber: order.orderNumber,
        orderId: order.id,
      }).catch(() => {});
    }

    return NextResponse.json({ orderId: order.id, orderNumber: order.orderNumber });
  } catch (error) {
    if (error instanceof Error && error.message === "QUOTE_ALREADY_CONVERTED") {
      return NextResponse.json(
        { error: "Quote already converted to an order" },
        { status: 409 }
      );
    }
    console.error("Error accepting quote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
