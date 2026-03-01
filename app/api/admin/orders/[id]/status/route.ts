import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { updateOrderStatus } from "@/lib/db/orders";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from "@/lib/email";
import { awardLoyaltyPoints } from "@/lib/loyalty";

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
        const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://wholesailhub.com"
        const clientPhone = fullOrder.organization?.phone
        if (clientPhone) {
          const { sendMessage, toE164 } = await import("@/lib/integrations/blooio")
          const normalizedPhone = toE164(clientPhone)

          let smsText: string | null = null

          if (parsed.data.status === "CONFIRMED") {
            smsText = `Your Wholesail order ${fullOrder.orderNumber} is confirmed — we're packing it now. You'll get another text when it ships.`
          } else if (parsed.data.status === "SHIPPED") {
            smsText = `Your Wholesail order ${fullOrder.orderNumber} has shipped and is on its way. Questions? Reply here or visit ${APP_URL}/client-portal/orders`
          } else if (parsed.data.status === "DELIVERED") {
            smsText = `Your Wholesail order ${fullOrder.orderNumber} has been delivered. Enjoy! Reply here if anything needs attention.`
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
        }
      }
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
