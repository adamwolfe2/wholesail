import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { updateOrderStatus } from "@/lib/db/orders";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendOrderShippedEmail, sendOrderDeliveredEmail, sendInvoiceEmail } from "@/lib/email";
import { awardLoyaltyPoints } from "@/lib/loyalty";
import { generateInvoiceForOrder } from "@/app/api/billing/generate/route";
import { format } from "date-fns";
import { dispatchWebhook } from "@/lib/webhooks";
import { getSiteUrl } from "@/lib/brand";
import { notifyOrg } from "@/lib/notifications";
import { portalConfig } from "@/lib/portal-config";

const statusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, error } = await requireAdmin();
    if (error) return error;

    const body = await req.json();
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const { id } = await params;
    const order = await updateOrderStatus(id, parsed.data.status, userId);

    // Send email notifications for key status changes (fire-and-forget)
    if (
      parsed.data.status === "CONFIRMED" ||
      parsed.data.status === "SHIPPED" ||
      parsed.data.status === "DELIVERED"
    ) {
      const fullOrder = await prisma.order.findUnique({
        where: { id },
        include: { organization: true },
      });

      if (fullOrder) {
        const emailData = {
          orderNumber: fullOrder.orderNumber,
          customerName: fullOrder.organization.contactPerson,
          customerEmail: fullOrder.organization.email,
        };

        if (parsed.data.status === "SHIPPED") {
          sendOrderShippedEmail(emailData).catch((err) =>
            console.error("Shipped email error:", err)
          );
        } else if (parsed.data.status === "DELIVERED") {
          sendOrderDeliveredEmail(emailData).catch((err) =>
            console.error("Delivered email error:", err)
          );
        }

        // SMS notification to client
        const APP_URL = getSiteUrl()
        const brandName = portalConfig.brandNameServer
        const clientPhone = fullOrder.organization?.phone
        if (clientPhone) {
          const { sendMessage, toE164 } = await import("@/lib/integrations/blooio")
          const normalizedPhone = toE164(clientPhone)

          let smsText: string | null = null

          if (parsed.data.status === "CONFIRMED") {
            smsText = `Your ${brandName} order ${fullOrder.orderNumber} is confirmed — we're packing it now. You'll get another text when it ships.`
          } else if (parsed.data.status === "SHIPPED") {
            smsText = `Your ${brandName} order ${fullOrder.orderNumber} has shipped and is on its way. Questions? Reply here or visit ${APP_URL}/client-portal/orders`
          } else if (parsed.data.status === "DELIVERED") {
            smsText = `Your ${brandName} order ${fullOrder.orderNumber} has been delivered. Enjoy! Reply here if anything needs attention.`
          }

          if (smsText && normalizedPhone) {
            sendMessage({ to: normalizedPhone, message: smsText }).catch((err: unknown) =>
              console.error("SMS notification failed:", err)
            )
          }
        }

        // Check for tier upgrade after delivery (fire-and-forget)
        if (parsed.data.status === "DELIVERED") {
          const { checkAndUpgradeTier } = await import("@/lib/tier-upgrade")
          checkAndUpgradeTier(fullOrder.organizationId).catch(console.error)

          // Award loyalty points (fire-and-forget)
          awardLoyaltyPoints(
            fullOrder.organizationId,
            Number(fullOrder.total),
            fullOrder.id
          ).catch(console.error)

          // Auto-invoicing: generate invoice if org has autoInvoice enabled
          const org = await prisma.organization.findUnique({
            where: { id: fullOrder.organizationId },
            select: { autoInvoice: true, contactPerson: true, email: true },
          })
          if (org?.autoInvoice) {
            generateInvoiceForOrder(fullOrder.id, userId).then((result) => {
              if (result?.created) {
                // Send invoice email to client
                sendInvoiceEmail({
                  invoiceNumber: result.invoice.invoiceNumber,
                  customerName: org.contactPerson,
                  customerEmail: org.email,
                  total: Number(result.invoice.total),
                  dueDate: format(result.invoice.dueDate, "MMMM d, yyyy"),
                }).catch((err) => console.error("Auto-invoice email error:", err))
              }
            }).catch((err) => console.error("Auto-invoice generation error:", err))
          }
        }
      }
    }

    // In-app notification for org members
    if (order.organizationId) {
      notifyOrg(
        order.organizationId,
        "ORDER_UPDATE",
        `Order ${order.orderNumber} ${parsed.data.status.toLowerCase()}`,
        `Your order has been updated to ${parsed.data.status.toLowerCase()}.`,
        `/client-portal/orders/${order.orderNumber}`,
      ).catch(() => {}); // non-blocking
    }

    // Dispatch webhook
    dispatchWebhook("order.status_changed", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      previousStatus: body.previousStatus ?? null,
      newStatus: parsed.data.status,
    }).catch(() => {});

    return NextResponse.json({ order });
  } catch (error) {
    const { captureWithContext } = await import("@/lib/sentry");
    captureWithContext(error, { route: "admin/orders/[id]/status", action: "patch" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
