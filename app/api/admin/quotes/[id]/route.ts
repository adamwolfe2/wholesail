import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { z } from "zod";
import { sendQuoteToClientEmail } from "@/lib/email";
import { notifyDistributorsForOrder } from "@/lib/db/orders";
import { createOrderWithRetry } from "@/lib/order-number";
import { notifyOrg } from "@/lib/notifications";

const patchSchema = z.object({
  action: z.enum(["accept", "decline", "convert", "send"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        items: true,
        organization: {
          select: {
            name: true,
            email: true,
            contactPerson: true,
            members: { take: 1, select: { id: true } },
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (parsed.data.action === "send") {
      if (quote.status !== "DRAFT") {
        return NextResponse.json(
          { error: "Only DRAFT quotes can be sent to the client" },
          { status: 400 }
        );
      }
      const updated = await prisma.quote.update({
        where: { id },
        data: { status: "SENT", sentAt: new Date() },
      });
      try {
        await prisma.auditEvent.create({
          data: {
            entityType: "Quote",
            entityId: id,
            action: "quote_sent_to_client",
            userId,
            metadata: { quoteNumber: quote.quoteNumber },
          },
        });
      } catch {
        // non-fatal
      }
      // Notify the client
      if (quote.organization.email) {
        sendQuoteToClientEmail({
          quoteNumber: quote.quoteNumber,
          quoteId: id,
          clientName: quote.organization.contactPerson || quote.organization.name,
          clientEmail: quote.organization.email,
          total: Number(quote.total),
          expiresAt: quote.expiresAt,
          notes: quote.notes,
        }).catch(() => {});
      }
      // In-app notification for org members
      notifyOrg(
        quote.organizationId,
        "QUOTE_RECEIVED",
        `New quote ${quote.quoteNumber} received`,
        `You have a new quote for ${formatCurrency(quote.total)}. Review and accept it to place your order.`,
        `/client-portal/quotes/${quote.quoteNumber}`,
      ).catch(() => {}); // non-blocking

      return NextResponse.json({ quote: updated });
    }

    if (parsed.data.action === "accept") {
      const updated = await prisma.quote.update({
        where: { id },
        data: { status: "ACCEPTED", acceptedAt: new Date() },
      });
      return NextResponse.json({ quote: updated });
    }

    if (parsed.data.action === "decline") {
      const updated = await prisma.quote.update({
        where: { id },
        data: { status: "DECLINED" },
      });
      return NextResponse.json({ quote: updated });
    }

    if (parsed.data.action === "convert") {
      if (quote.convertedOrderId) {
        return NextResponse.json(
          { error: "Quote already converted" },
          { status: 409 }
        );
      }

      if (quote.organization.members.length === 0) {
        return NextResponse.json(
          { error: "Organization has no members" },
          { status: 422 }
        );
      }

      const clientUserId = quote.organization.members[0].id;

      // Fetch distributor assignment for each product
      const quoteProductIds = quote.items.map((i) => i.productId).filter((id): id is string => id !== null);
      const quoteProducts = await prisma.product.findMany({
        where: { id: { in: quoteProductIds } },
        select: { id: true, distributorOrgId: true },
      });
      const productDistributorMap = new Map(quoteProducts.map((p) => [p.id, p.distributorOrgId ?? null]));

      // Use a transaction to prevent duplicate orders from concurrent convert requests
      const { order, updated } = await prisma.$transaction(async (tx) => {
        // Re-check inside the transaction to prevent race conditions
        const freshQuote = await tx.quote.findUniqueOrThrow({
          where: { id },
          select: { convertedOrderId: true },
        });

        if (freshQuote.convertedOrderId) {
          throw new Error("ALREADY_CONVERTED");
        }

        const createdOrder = await createOrderWithRetry(async (orderNumber) => {
          return tx.order.create({
            data: {
              orderNumber,
              organizationId: quote.organizationId,
              userId: clientUserId,
              placedByRepId: quote.repId ?? undefined,
              status: "PENDING",
              subtotal: quote.subtotal,
              tax: 0,
              deliveryFee: 0,
              total: quote.total,
              notes: quote.notes,
              items: {
                create: quote.items.map((item) => ({
                  productId: item.productId,
                  name: item.name,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  total: item.total,
                  distributorOrgId: (item.productId ? productDistributorMap.get(item.productId) : undefined) ?? null,
                })),
              },
            },
          });
        });

        const updatedQuote = await tx.quote.update({
          where: { id },
          data: {
            status: "ACCEPTED",
            acceptedAt: new Date(),
            convertedOrderId: createdOrder.id,
          },
        });

        return { order: createdOrder, updated: updatedQuote };
      });

      notifyDistributorsForOrder({
        orderId: order.id,
        orderNumber: order.orderNumber,
        clientName: quote.organization.name,
        clientEmail: quote.organization.email ?? null,
        deliveryAddress: null,
      }).catch(() => {});

      // Audit event
      try {
        await prisma.auditEvent.create({
          data: {
            entityType: "Quote",
            entityId: id,
            action: "converted_to_order",
            userId,
            metadata: { orderId: order.id, orderNumber: order.orderNumber },
          },
        });
      } catch {
        // non-fatal
      }

      return NextResponse.json({ quote: updated, orderId: order.id, orderNumber: order.orderNumber });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "ALREADY_CONVERTED") {
      return NextResponse.json(
        { error: "Quote already converted" },
        { status: 409 }
      );
    }
    const { captureWithContext } = await import("@/lib/sentry");
    captureWithContext(error, { route: "admin/quotes/[id]", action: "patch" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
