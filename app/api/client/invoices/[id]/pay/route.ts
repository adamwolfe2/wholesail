import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isStripeConfigured, getStripeClient } from "@/lib/stripe/config";
import { getSiteUrl } from "@/lib/get-site-url";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Payment processing not configured" },
        { status: 503 }
      );
    }

    const { id } = await params;

    // Verify invoice belongs to the user's org
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, email: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { order: { select: { orderNumber: true } } },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (invoice.status === "PAID") {
      return NextResponse.json(
        { error: "Invoice is already paid" },
        { status: 400 }
      );
    }

    if (invoice.status === "DRAFT") {
      return NextResponse.json(
        { error: "Invoice is not yet ready for payment" },
        { status: 400 }
      );
    }

    const appUrl = getSiteUrl();

    const stripe = getStripeClient();
    // Idempotency key scoped to invoice — prevents duplicate sessions on concurrent requests
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Invoice ${invoice.invoiceNumber}`,
              description: invoice.order?.orderNumber
                ? `Order ${invoice.order.orderNumber}`
                : undefined,
            },
            unit_amount: Math.round(Number(invoice.total) * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.orderId,
      },
      success_url: `${appUrl}/client-portal/invoices?paid=${invoice.invoiceNumber}`,
      cancel_url: `${appUrl}/client-portal/invoices`,
    }, {
      idempotencyKey: `invoice-pay-${invoice.id}`,
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Invoice pay error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
