import { NextRequest, NextResponse } from "next/server";
import { isStripeConfigured, parseWebhookEvent } from "@/lib/stripe/config";
import { WebhookSignatureError } from "@/lib/stripe/errors";
import { updateOrderStatus, updateOrderStripeIds } from "@/lib/db/orders";
import { prisma } from "@/lib/db";
import {
  sendOrderConfirmation,
  sendInternalOrderNotification,
} from "@/lib/email";
import { generateInvoiceForOrder } from "@/app/api/billing/generate/route";
import {
  isConfigured as blooIsConfigured,
  sendMessage as blooSend,
  orderConfirmationMessage,
  toE164,
} from "@/lib/integrations/blooio";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ received: true });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = await parseWebhookEvent(body, signature);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    const msg = err instanceof WebhookSignatureError ? err.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ─── Checkout (one-time card payments) ──────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object;
        const invoiceId = session.metadata?.invoiceId;
        const orderId = session.metadata?.orderId;

        // ── Quote payment path ───────────────────────────────────────────
        // Quote pay sessions have type === 'quote_payment' in metadata
        if (session.metadata?.type === "quote_payment") {
          const quoteId = session.metadata?.quoteId;
          const orgId = session.metadata?.organizationId;

          if (!quoteId) {
            console.error("No quoteId in quote_payment session metadata");
            break;
          }

          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null;

          // Idempotency: skip if already converted
          const existingQuote = await prisma.quote.findUnique({
            where: { id: quoteId },
            select: {
              status: true,
              quoteNumber: true,
              total: true,
              convertedOrderId: true,
              organizationId: true,
              items: {
                include: { product: { select: { id: true } } },
              },
            },
          });

          if (!existingQuote) {
            console.error(`Quote ${quoteId} not found for payment`);
            break;
          }

          if (existingQuote.convertedOrderId) {
            console.info(`Quote ${quoteId} already converted — skipping`);
            break;
          }

          // Generate an order number
          const year = new Date().getFullYear();
          const orderCount = await prisma.order.count({
            where: {
              createdAt: {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`),
              },
            },
          });
          const orderNumber = `ORD-${year}-${String(orderCount + 1).padStart(4, "0")}`;

          // Get org's default shipping address
          const address = await prisma.address.findFirst({
            where: {
              organizationId: existingQuote.organizationId,
              isDefault: true,
            },
          });

          // Get the user ID for the organization (first member)
          const orgUser = await prisma.user.findFirst({
            where: { organizationId: existingQuote.organizationId },
            select: { id: true },
          });

          if (!orgUser) {
            console.error(
              `No user found for org ${existingQuote.organizationId}`
            );
            break;
          }

          // Create the order and payment record in a transaction
          const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
              data: {
                orderNumber,
                organizationId: existingQuote.organizationId,
                userId: orgUser.id,
                status: "CONFIRMED",
                subtotal: existingQuote.total,
                tax: 0,
                deliveryFee: 0,
                total: existingQuote.total,
                shippingAddressId: address?.id,
                stripeSessionId: session.id,
                stripePaymentIntentId: paymentIntentId,
                paidAt: new Date(),
                notes: `Created from quote ${existingQuote.quoteNumber}`,
                items: {
                  create: existingQuote.items.map((item) => ({
                    productId: item.productId,
                    name: item.name,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    total: item.total,
                  })),
                },
              },
              include: {
                items: true,
                organization: true,
              },
            });

            await tx.quote.update({
              where: { id: quoteId },
              data: { convertedOrderId: newOrder.id },
            });

            await tx.payment.create({
              data: {
                orderId: newOrder.id,
                amount: (session.amount_total ?? 0) / 100,
                method: "CARD",
                status: "COMPLETED",
                stripePaymentId: paymentIntentId,
              },
            });

            await tx.auditEvent.create({
              data: {
                entityType: "Quote",
                entityId: quoteId,
                action: "quote_paid_and_converted",
                metadata: {
                  stripeSessionId: session.id,
                  quoteNumber: existingQuote.quoteNumber,
                  orderNumber,
                  orderId: newOrder.id,
                  amount: (session.amount_total ?? 0) / 100,
                },
              },
            });

            return newOrder;
          });

          // Send order confirmation email (non-fatal)
          sendOrderConfirmation({
            orderNumber: order.orderNumber,
            orderId: order.id,
            customerName: order.organization.contactPerson,
            customerEmail: order.organization.email,
            items: order.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              unitPrice: Number(item.unitPrice),
              total: Number(item.total),
            })),
            subtotal: Number(order.subtotal),
            total: Number(order.total),
          }).catch((err) =>
            console.error("Quote payment confirmation email failed:", err)
          );

          console.info(
            `Quote ${quoteId} paid — order ${orderNumber} created`
          );
          break;
        }

        // ── Invoice Pay Now path ─────────────────────────────────────────
        // Invoice pay sessions have invoiceId in metadata (orderId is the
        // linked order ID, not the payment target)
        if (invoiceId) {
          const paymentIntentId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null;

          // Idempotency: skip if already paid
          const existingInv = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            select: { status: true, orderId: true },
          });
          if (existingInv?.status === "PAID") break;

          await prisma.$transaction([
            prisma.invoice.update({
              where: { id: invoiceId },
              data: { status: "PAID", paidAt: new Date() },
            }),
            prisma.payment.create({
              data: {
                orderId: existingInv?.orderId ?? orderId ?? invoiceId,
                amount: (session.amount_total ?? 0) / 100,
                method: "CARD",
                status: "COMPLETED",
                stripePaymentId: paymentIntentId,
              },
            }),
            prisma.auditEvent.create({
              data: {
                entityType: "Invoice",
                entityId: invoiceId,
                action: "invoice_paid_via_portal",
                metadata: {
                  stripeSessionId: session.id,
                  amount: (session.amount_total ?? 0) / 100,
                },
              },
            }),
          ]);

          console.info(`Invoice ${invoiceId} paid via client portal`);
          break;
        }

        if (!orderId) {
          console.error("No orderId in session metadata");
          break;
        }

        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id;

        // Idempotency check
        const existing = await prisma.order.findUnique({
          where: { id: orderId },
          select: { status: true, stripeSessionId: true },
        });

        if (existing?.stripeSessionId === session.id) {
          // Session already recorded — guard against partial failure where
          // stripeSessionId was saved but payment.create or status update crashed
          if (existing.status !== "CONFIRMED") {
            await updateOrderStatus(orderId, "CONFIRMED");
          }
          const existingPayment = await prisma.payment.findFirst({
            where: { orderId, status: "COMPLETED" },
          });
          if (!existingPayment) {
            await prisma.payment.create({
              data: {
                orderId,
                amount: (session.amount_total ?? 0) / 100,
                method: "CARD",
                status: "COMPLETED",
                stripePaymentId: paymentIntentId,
              },
            });
          }
          break;
        }

        await updateOrderStripeIds(orderId, {
          stripeSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
        });

        await updateOrderStatus(orderId, "CONFIRMED");

        await prisma.payment.create({
          data: {
            orderId,
            amount: (session.amount_total ?? 0) / 100,
            method: "CARD",
            status: "COMPLETED",
            stripePaymentId: paymentIntentId,
          },
        });

        await prisma.auditEvent.create({
          data: {
            entityType: "Payment",
            entityId: orderId,
            action: "payment_received",
            metadata: {
              stripeSessionId: session.id,
              amount: (session.amount_total ?? 0) / 100,
              event: event.type,
            },
          },
        });

        // Auto-generate Net-30 invoice (non-fatal)
        generateInvoiceForOrder(orderId).catch((err) =>
          console.error("Invoice auto-gen failed:", err)
        );

        // Fire-and-forget emails + Bloo.io SMS
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { organization: true, items: true },
        });

        if (order) {
          const emailData = {
            orderNumber: order.orderNumber,
            orderId: order.id,
            customerName: order.organization.contactPerson,
            customerEmail: order.organization.email,
            items: order.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              unitPrice: Number(item.unitPrice),
              total: Number(item.total),
            })),
            subtotal: Number(order.subtotal),
            total: Number(order.total),
          };
          await Promise.all([
            sendOrderConfirmation(emailData),
            sendInternalOrderNotification(emailData),
            // Bloo.io iMessage/SMS notification
            blooIsConfigured() && toE164(order.organization.phone ?? '')
              ? blooSend({
                  to: toE164(order.organization.phone ?? '') as string,
                  message: orderConfirmationMessage(
                    order.orderNumber,
                    order.organization.name
                  ),
                })
              : Promise.resolve(),
          ]).catch((err) => console.error("Notification error:", err));
        }

        console.info(`Order ${orderId} paid via checkout`);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          // Cancel the orphaned PENDING order so it doesn't sit in limbo
          await updateOrderStatus(orderId, "CANCELLED").catch(() => {});
          await prisma.auditEvent.create({
            data: {
              entityType: "Order",
              entityId: orderId,
              action: "checkout_expired",
              metadata: { stripeSessionId: session.id },
            },
          });
        }
        break;
      }

      // ─── Payment Intent ─────────────────────────────────────────────────
      case "payment_intent.succeeded": {
        const intent = event.data.object;
        const orderId = intent.metadata?.orderId;
        if (orderId) {
          await prisma.auditEvent.create({
            data: {
              entityType: "Payment",
              entityId: orderId,
              action: "payment_intent_succeeded",
              metadata: {
                paymentIntentId: intent.id,
                amount: intent.amount,
              },
            },
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object;
        const orderId = intent.metadata?.orderId;
        if (orderId) {
          await prisma.auditEvent.create({
            data: {
              entityType: "Payment",
              entityId: orderId,
              action: "payment_failed",
              metadata: {
                error: intent.last_payment_error?.message,
                paymentIntentId: intent.id,
              },
            },
          });
        }
        break;
      }

      // ─── Invoices (Net-30/60/90 B2B) ────────────────────────────────────
      case "invoice.finalized": {
        const inv = event.data.object;
        const orderId = inv.metadata?.orderId;
        if (orderId) {
          await prisma.auditEvent.create({
            data: {
              entityType: "Invoice",
              entityId: orderId,
              action: "invoice_finalized",
              metadata: { stripeInvoiceId: inv.id, hostedUrl: inv.hosted_invoice_url },
            },
          });
        }
        break;
      }

      case "invoice.paid": {
        const inv = event.data.object;
        const orderId = inv.metadata?.orderId;

        if (!orderId) break;

        // Idempotency: check if invoice is already marked paid
        const existingInv = await prisma.invoice.findFirst({
          where: { orderId, status: "PAID" },
        });
        if (existingInv) break;

        // Get the invoice to find organizationId for dunning check
        const paidInvoice = await prisma.invoice.findFirst({
          where: { orderId },
          select: { organizationId: true },
        });

        await prisma.$transaction([
          prisma.invoice.updateMany({
            where: { orderId },
            data: { status: "PAID", paidAt: new Date() },
          }),
          prisma.payment.create({
            data: {
              orderId,
              amount: (inv.amount_paid ?? 0) / 100,
              method: "ACH",
              status: "COMPLETED",
              stripePaymentId: null, // Stripe Invoice type doesn't expose payment_intent directly
            },
          }),
          prisma.auditEvent.create({
            data: {
              entityType: "Invoice",
              entityId: orderId,
              action: "invoice_paid",
              metadata: {
                stripeInvoiceId: inv.id,
                amount: (inv.amount_paid ?? 0) / 100,
              },
            },
          }),
        ]);

        // Lift dunning suspension if org has no remaining overdue invoices
        if (paidInvoice?.organizationId) {
          const orgId = paidInvoice.organizationId;
          const wasSuspended = await prisma.auditEvent.findFirst({
            where: { entityType: "Organization", entityId: orgId, action: "dunning_suspended" },
            orderBy: { createdAt: "desc" },
            select: { id: true },
          });
          if (wasSuspended) {
            const remainingOverdue = await prisma.invoice.count({
              where: { organizationId: orgId, status: "OVERDUE" },
            });
            if (remainingOverdue === 0) {
              await prisma.auditEvent.create({
                data: {
                  entityType: "Organization",
                  entityId: orgId,
                  action: "dunning_suspension_lifted",
                  metadata: { reason: "All overdue invoices resolved", triggeredBy: "invoice_paid" },
                },
              });
              console.info(`Dunning suspension lifted for org ${orgId}`);
            }
          }
        }

        console.info(`Invoice paid for order ${orderId} via Stripe`);
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object;
        const orderId = inv.metadata?.orderId;
        if (orderId) {
          await prisma.invoice.updateMany({
            where: { orderId },
            data: { status: "OVERDUE" },
          });
          await prisma.auditEvent.create({
            data: {
              entityType: "Invoice",
              entityId: orderId,
              action: "invoice_payment_failed",
              metadata: {
                stripeInvoiceId: inv.id,
                attemptCount: inv.attempt_count,
              },
            },
          });
        }
        break;
      }

      // ─── Refunds ────────────────────────────────────────────────────────
      case "charge.refunded": {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent as string | null;

        if (paymentIntentId) {
          // Mark the Payment record as refunded
          const payment = await prisma.payment.findFirst({
            where: { stripePaymentId: paymentIntentId },
            select: { id: true, orderId: true },
          });

          if (payment) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: { status: "REFUNDED" },
            });

            await prisma.auditEvent.create({
              data: {
                entityType: "Payment",
                entityId: payment.orderId,
                action: "charge_refunded",
                metadata: {
                  chargeId: charge.id,
                  paymentIntentId,
                  amountRefunded: charge.amount_refunded,
                  fullyRefunded: charge.refunded,
                },
              },
            });

            console.info(`Refund recorded for charge ${charge.id}, order ${payment.orderId}`);
          }
        }
        break;
      }

      // ─── Disputes ───────────────────────────────────────────────────────
      case "charge.dispute.created": {
        const dispute = event.data.object;
        await prisma.auditEvent.create({
          data: {
            entityType: "Payment",
            entityId: dispute.payment_intent as string ?? "unknown",
            action: "dispute_created",
            metadata: {
              disputeId: dispute.id,
              reason: dispute.reason,
              amount: dispute.amount,
            },
          },
        });
        console.warn(`⚠️  Stripe dispute created: ${dispute.id} — reason: ${dispute.reason}`);
        break;
      }

      default:
        // Unhandled event — log and return 200 so Stripe doesn't retry
        console.warn(`Unhandled Stripe event: ${event.type}`);
    }
  } catch (err) {
    console.error(`Error processing Stripe event ${event.type}:`, err);
    // Return 500 so Stripe will retry the event
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
