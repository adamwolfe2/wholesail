import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createOrder, updateOrderStripeIds, updateOrderStatus } from "@/lib/db/orders";
import { createCheckoutSession, isStripeConfigured } from "@/lib/payments/stripe";
import { getOrganizationByUserId } from "@/lib/db/organizations";
import { generateInvoiceForOrder } from "@/app/api/billing/generate/route";
import { sendOrderConfirmation, sendInternalOrderNotification } from "@/lib/email";
import { z } from "zod";
import { checkoutLimiter, checkRateLimit, getIp } from "@/lib/rate-limit";
import { getCreditStatus } from "@/lib/credit";
import { processReferralConversion } from "@/lib/referrals";
import { redeemLoyaltyPoints, POINTS_PER_DOLLAR_REDEMPTION } from "@/lib/loyalty";
import { getSiteUrl } from "@/lib/get-site-url";

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
    })
  ),
  businessName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  deliveryAddress: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  notes: z.string().optional(),
  applyCredits: z.boolean().optional(),
  redeemPoints: z.number().int().min(0).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { allowed } = await checkRateLimit(checkoutLimiter, getIp(req))
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const { prisma } = await import("@/lib/db");

    // Ensure user exists in DB (handles case where Clerk webhook isn't set up yet)
    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email: data.email,
        name: data.contactName,
        role: "CLIENT",
      },
      update: {},
    });

    // Get or create organization for this user
    let org = await getOrganizationByUserId(userId);

    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: data.businessName,
          contactPerson: data.contactName,
          email: data.email,
          phone: data.phone,
          members: { connect: { id: userId } },
          addresses: {
            create: {
              type: "SHIPPING",
              street: data.deliveryAddress,
              city: data.city,
              state: data.state,
              zip: data.zip,
              isDefault: true,
            },
          },
        },
        include: { addresses: true },
      });
    }

    // Credit limit check — block if org is at limit, warn if near limit
    let creditWarning: string | undefined
    if (org) {
      const creditStatus = await getCreditStatus(org.id)
      if (creditStatus.isAtLimit) {
        return NextResponse.json(
          { error: 'Credit limit reached', code: 'CREDIT_LIMIT_EXCEEDED' },
          { status: 402 }
        )
      }
      if (creditStatus.isNearLimit) {
        creditWarning = 'You are approaching your credit limit'
      }
    }

    // Referral credit to apply
    const referralCredits = Number(org.referralCredits ?? 0);
    const referralCreditToApply = data.applyCredits && referralCredits > 0 ? referralCredits : 0;

    // Loyalty points to redeem
    const pointsToRedeem = data.redeemPoints && data.redeemPoints > 0
      ? Math.min(data.redeemPoints, org.loyaltyPoints ?? 0)
      : 0;
    const loyaltyDollarDiscount = pointsToRedeem / POINTS_PER_DOLLAR_REDEMPTION;

    const creditToApply = referralCreditToApply + loyaltyDollarDiscount;

    // Resolve product IDs — support both CUID (from DB) and slug (legacy cart items)
    const resolvedItems = await Promise.all(
      data.items.map(async (item) => {
        const product = await prisma.product.findFirst({
          where: { OR: [{ id: item.productId }, { slug: item.productId }] },
          select: { id: true },
        });
        if (!product) {
          throw Object.assign(new Error(`Product not found: ${item.productId}`), { statusCode: 400 });
        }
        return { ...item, productId: product.id };
      })
    );

    // Create the order (pass state for tax calculation + org ID for tier discount)
    const order = await createOrder({
      organizationId: org.id,
      userId,
      items: resolvedItems,
      shippingAddressId: org.addresses?.[0]?.id,
      shippingState: data.state,
      notes: data.notes,
      creditApplied: creditToApply,
    });

    // Deduct referral credits from org balance
    if (referralCreditToApply > 0) {
      const appliedReferral = Math.min(referralCreditToApply, Number(order.creditApplied));
      await prisma.organization.update({
        where: { id: org.id },
        data: { referralCredits: { decrement: appliedReferral } },
      });
      await prisma.auditEvent.create({
        data: {
          entityType: "Order",
          entityId: order.id,
          action: "referral_credit_applied",
          userId,
          metadata: { creditApplied: appliedReferral, orgId: org.id },
        },
      });
    }

    // Redeem loyalty points
    if (pointsToRedeem > 0) {
      await redeemLoyaltyPoints(org.id, pointsToRedeem);
    }

    // Process referral conversion (fire-and-forget — safe to call on every order)
    processReferralConversion(org.id, data.email).catch(() => {});

    // Demo mode: no Stripe configured — confirm order directly
    if (!isStripeConfigured()) {
      await updateOrderStatus(order.id, "CONFIRMED");
      await prisma.auditEvent.create({
        data: {
          entityType: "Order",
          entityId: order.id,
          action: "demo_order_confirmed",
          userId,
          metadata: { note: "Stripe not configured — confirmed without payment" },
        },
      });

      // Generate Net-30 invoice for the confirmed order
      try {
        await generateInvoiceForOrder(order.id, userId);
      } catch (invoiceErr) {
        console.error("Invoice generation failed (non-fatal):", invoiceErr);
      }

      // Fire Bloo.io iMessage to org contact (fire-and-forget)
      const { isConfigured: blooConfigured, sendMessage: blooSend, orderConfirmationMessage, toE164 } = await import("@/lib/integrations/blooio");
      const blooPhone = org.phone ? toE164(org.phone) : null;
      if (blooConfigured() && blooPhone) {
        blooSend({ to: blooPhone, message: orderConfirmationMessage(order.orderNumber, org.name) })
          .catch((err) => console.error("Bloo.io send error:", err));
      }

      // Send confirmation email to client + internal ops notification (fire-and-forget)
      const emailData = {
        orderNumber: order.orderNumber,
        orderId: order.id,
        customerName: data.contactName,
        customerEmail: data.email,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          total: Number(item.total),
        })),
        subtotal: Number(order.subtotal),
        total: Number(order.total),
      };
      sendOrderConfirmation(emailData).catch(() => {});
      sendInternalOrderNotification(emailData).catch(() => {});

      return NextResponse.json({
        orderId: order.id,
        orderNumber: order.orderNumber,
        // No checkoutUrl — checkout page falls through to confirmation
        ...(creditWarning ? { warning: creditWarning } : {}),
      });
    }

    // Stripe configured — create checkout session
    const appUrl = getSiteUrl();
    const successUrl = `${appUrl}/confirmation?order=${order.orderNumber}`;
    const cancelUrl = `${appUrl}/checkout?cancelled=true`;
    const session = await createCheckoutSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      items: data.items,
      customerEmail: data.email,
      successUrl,
      cancelUrl,
    });

    await updateOrderStripeIds(order.id, {
      stripeSessionId: session.id,
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      checkoutUrl: session.url,
      ...(creditWarning ? { warning: creditWarning } : {}),
    });
  } catch (error) {
    const err = error as Error & { type?: string; code?: string; statusCode?: number; param?: string; raw?: unknown };
    console.error("Checkout error:", err.message, "| type:", err.type, "| code:", err.code, "| param:", err.param, "| raw:", JSON.stringify(err.raw ?? null));
    const statusCode = err.statusCode;
    if (statusCode === 400) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
