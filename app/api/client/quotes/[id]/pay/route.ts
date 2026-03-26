import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isStripeConfigured, getStripeClient } from "@/lib/stripe/config";
import { notifyDistributorsForOrder } from "@/lib/db/orders";
import { getSiteUrl } from "@/lib/get-site-url";
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

    // Verify quote belongs to user's org
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
        items: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
        organization: {
          select: { id: true, name: true, email: true, contactPerson: true },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (quote.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (quote.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "Quote must be accepted before payment" },
        { status: 400 }
      );
    }

    const appUrl = getSiteUrl();

    // ── Demo mode: no Stripe configured ──────────────────────────────────────
    if (!isStripeConfigured()) {
      // Get org's default shipping address
      const address = await prisma.address.findFirst({
        where: {
          organizationId: quote.organizationId,
          isDefault: true,
        },
      });

      // Fetch distributor assignment for each product
      const payProductIds = quote.items.map((i) => i.productId).filter((id): id is string => id !== null);
      const payProducts = await prisma.product.findMany({
        where: { id: { in: payProductIds } },
        select: { id: true, distributorOrgId: true },
      });
      const payDistributorMap = new Map(payProducts.map((p) => [p.id, p.distributorOrgId ?? null]));

      // Create an order from the quote items with retry on duplicate order number
      const order = await createOrderWithRetry(async (orderNumber) => {
        return prisma.order.create({
          data: {
            orderNumber,
            organizationId: quote.organizationId,
            userId,
            status: "CONFIRMED",
            subtotal: quote.subtotal,
            tax: 0,
            deliveryFee: 0,
            total: quote.total,
            shippingAddressId: address?.id,
            notes: `Created from quote ${quote.quoteNumber}`,
            paidAt: new Date(),
            items: {
              create: quote.items.map((item) => ({
                productId: item.productId,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total,
                distributorOrgId: (item.productId ? payDistributorMap.get(item.productId) : undefined) ?? null,
              })),
            },
          },
        });
      });

      notifyDistributorsForOrder({
        orderId: order.id,
        orderNumber: order.orderNumber,
        clientName: quote.organization.name,
        clientEmail: quote.organization.email ?? null,
        deliveryAddress: null,
      }).catch(() => {});

      // Update quote: mark as converted
      await prisma.quote.update({
        where: { id },
        data: { convertedOrderId: order.id },
      });

      await prisma.auditEvent.create({
        data: {
          entityType: "Quote",
          entityId: id,
          action: "quote_converted_to_order_demo",
          userId,
          metadata: {
            quoteNumber: quote.quoteNumber,
            orderNumber: order.orderNumber,
            orderId: order.id,
            note: "Stripe not configured — order confirmed without payment",
          },
        },
      });

      return NextResponse.json({ demoMode: true, orderNumber: order.orderNumber });
    }

    // ── Stripe checkout session ───────────────────────────────────────────────
    const stripe = getStripeClient();

    const successUrl = `${appUrl}/client-portal/quotes/${id}?paid=true`;
    const cancelUrl = `${appUrl}/client-portal/quotes/${id}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: quote.organization.email,
      line_items: quote.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(Number(item.unitPrice) * 100),
        },
        quantity: item.quantity,
      })),
      payment_method_types: ["card"],
      metadata: {
        quoteId: id,
        quoteNumber: quote.quoteNumber,
        organizationId: quote.organizationId,
        type: "quote_payment",
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    await prisma.auditEvent.create({
      data: {
        entityType: "Quote",
        entityId: id,
        action: "quote_checkout_initiated",
        userId,
        metadata: {
          quoteNumber: quote.quoteNumber,
          stripeSessionId: session.id,
          amount: Number(quote.total),
        },
      },
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Quote pay error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
