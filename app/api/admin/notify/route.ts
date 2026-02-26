import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";
import {
  sendMessage,
  toE164,
  orderConfirmationMessage,
  orderShippedMessage,
  orderDeliveredMessage,
  invoiceReminderMessage,
  welcomePartnerMessage,
} from "@/lib/integrations/blooio";

const notifySchema = z.object({
  type: z.enum([
    "order_confirmation",
    "order_shipped",
    "order_delivered",
    "invoice_reminder",
    "welcome_partner",
    "custom",
  ]),
  organizationId: z.string(),
  orderId: z.string().optional(),
  invoiceId: z.string().optional(),
  customMessage: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = notifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { type, organizationId, orderId, invoiceId, customMessage } =
      parsed.data;

    // Get organization phone
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { phone: true, name: true, contactPerson: true },
    });

    const e164 = org?.phone ? toE164(org.phone) : null
    if (!org || !e164) {
      return NextResponse.json(
        { error: "Organization not found or phone number cannot be normalized to E.164" },
        { status: 404 }
      );
    }

    let message: string;

    switch (type) {
      case "order_confirmation": {
        if (!orderId)
          return NextResponse.json(
            { error: "orderId required" },
            { status: 400 }
          );
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          select: { orderNumber: true },
        });
        if (!order)
          return NextResponse.json(
            { error: "Order not found" },
            { status: 404 }
          );
        message = orderConfirmationMessage(order.orderNumber, org.name);
        break;
      }
      case "order_shipped": {
        if (!orderId)
          return NextResponse.json(
            { error: "orderId required" },
            { status: 400 }
          );
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          select: { orderNumber: true },
        });
        if (!order)
          return NextResponse.json(
            { error: "Order not found" },
            { status: 404 }
          );
        message = orderShippedMessage(order.orderNumber, org.name);
        break;
      }
      case "order_delivered": {
        if (!orderId)
          return NextResponse.json(
            { error: "orderId required" },
            { status: 400 }
          );
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          select: { orderNumber: true },
        });
        if (!order)
          return NextResponse.json(
            { error: "Order not found" },
            { status: 404 }
          );
        message = orderDeliveredMessage(order.orderNumber, org.name);
        break;
      }
      case "invoice_reminder": {
        if (!invoiceId)
          return NextResponse.json(
            { error: "invoiceId required" },
            { status: 400 }
          );
        const invoice = await prisma.invoice.findUnique({
          where: { id: invoiceId },
          select: { invoiceNumber: true, total: true, dueDate: true },
        });
        if (!invoice)
          return NextResponse.json(
            { error: "Invoice not found" },
            { status: 404 }
          );
        message = invoiceReminderMessage(
          invoice.invoiceNumber,
          Number(invoice.total).toFixed(2),
          invoice.dueDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        );
        break;
      }
      case "welcome_partner": {
        message = welcomePartnerMessage(org.name, org.contactPerson);
        break;
      }
      case "custom": {
        if (!customMessage)
          return NextResponse.json(
            { error: "customMessage required" },
            { status: 400 }
          );
        message = customMessage;
        break;
      }
    }

    const result = await sendMessage({
      to: e164,
      message,
    });

    // Log the notification
    await prisma.auditEvent.create({
      data: {
        entityType: "Notification",
        entityId: organizationId,
        action: "message_sent",
        userId,
        metadata: {
          type,
          channel: "blooio",
          success: result.success,
          chatId: result.chatId,
          orderId,
          invoiceId,
        },
      },
    });

    return NextResponse.json({
      success: result.success,
      chatId: result.chatId,
      preview: message,
    });
  } catch (error) {
    console.error("Notify error:", error);

    // If Bloo.io is not configured, return a helpful message
    if (
      error instanceof Error &&
      error.message.includes("not configured")
    ) {
      return NextResponse.json(
        {
          error: "Bloo.io messaging not configured",
          hint: "Set BLOOIO_API_KEY and BLOOIO_FROM_NUMBER in your .env file",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
