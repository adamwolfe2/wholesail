import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { captureWithContext } from "@/lib/sentry";
import { requireAdmin } from "@/lib/auth/require-admin";
import { z } from "zod";
import { getSiteUrl } from "@/lib/brand";

const createShipmentSchema = z.object({
  orderId: z.string(),
  carrier: z.string().optional(),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
  driverNotes: z.string().optional(),
  trackingNumber: z.string().optional(),
  estimatedEta: z.string().optional(), // ISO string or datetime-local value
  etaWindowEnd: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAdmin();
  if (error) return error;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const parsed = createShipmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      orderId,
      carrier,
      driverName,
      driverPhone,
      driverNotes,
      trackingNumber,
      estimatedEta,
      etaWindowEnd,
    } = parsed.data;

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { organization: { select: { name: true, phone: true } } },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if shipment already exists
    const existing = await prisma.shipment.findUnique({ where: { orderId } });
    if (existing) {
      return NextResponse.json(
        { error: "Shipment already exists for this order" },
        { status: 409 }
      );
    }

    const etaDate = estimatedEta ? new Date(estimatedEta) : null;
    const etaEndDate = etaWindowEnd ? new Date(etaWindowEnd) : null;

    const shipment = await prisma.shipment.create({
      data: {
        orderId,
        carrier: carrier ?? null,
        driverName: driverName ?? null,
        driverPhone: driverPhone ?? null,
        driverNotes: driverNotes ?? null,
        trackingNumber: trackingNumber ?? null,
        estimatedEta: etaDate,
        etaWindowEnd: etaEndDate,
        status: "PREPARING",
      },
    });

    // Create initial ShipmentEvent
    const dispatchDescription = driverName
      ? `Order dispatched — driver: ${driverName}${carrier ? ` via ${carrier}` : ""}`
      : `Order dispatched${carrier ? ` via ${carrier}` : ""}`;

    await prisma.shipmentEvent.create({
      data: {
        shipmentId: shipment.id,
        status: "PREPARING",
        description: dispatchDescription,
      },
    });

    // Audit event
    await prisma.auditEvent.create({
      data: {
        entityType: "Shipment",
        entityId: shipment.id,
        action: "created",
        userId,
        metadata: { orderId, carrier, driverName },
      },
    });

    // SMS client notification with ETA (fire-and-forget)
    const clientPhone = order.organization?.phone;
    if (clientPhone) {
      const APP_URL = getSiteUrl();
      const { sendMessage, toE164 } = await import("@/lib/integrations/blooio");
      const normalizedPhone = toE164(clientPhone);

      if (normalizedPhone) {
        let etaText = "";
        if (etaDate) {
          const formatted = etaDate.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          etaText = ` ETA: ${formatted}`;
          if (etaEndDate) {
            etaText += ` – ${etaEndDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
          }
        }

        const driverPart = driverName ? ` Driver: ${driverName}.` : "";
        const smsText = `Your Wholesail order ${order.orderNumber} has been dispatched and is on its way.${driverPart}${etaText} Track your order: ${APP_URL}/client-portal/orders/${order.orderNumber}/tracking`;

        sendMessage({ to: normalizedPhone, message: smsText }).catch((err: unknown) =>
          console.error("Dispatch SMS notification failed:", err)
        );
      }
    }

    return NextResponse.json({ shipment }, { status: 201 });
  } catch (err) {
    captureWithContext(err instanceof Error ? err : new Error("Unknown error"), {
      route: "POST /api/shipments",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
