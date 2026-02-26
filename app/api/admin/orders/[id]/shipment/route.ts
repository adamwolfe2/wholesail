import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { z } from "zod";

const updateShipmentSchema = z.object({
  deliveryPhotoUrl: z.string().url().optional(),
  deliverySignature: z.string().optional(),
  status: z
    .enum(["PREPARING", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION"])
    .optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdmin();
  if (error) return error;

  try {
    const { id: orderId } = await params;
    const body = await req.json();
    const parsed = updateShipmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Find the shipment via the order
    const shipment = await prisma.shipment.findUnique({ where: { orderId } });
    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found for this order" }, { status: 404 });
    }

    const { deliveryPhotoUrl, deliverySignature, status } = parsed.data;

    const updated = await prisma.shipment.update({
      where: { id: shipment.id },
      data: {
        ...(deliveryPhotoUrl !== undefined && { deliveryPhotoUrl }),
        ...(deliverySignature !== undefined && { deliverySignature }),
        ...(status !== undefined && { status }),
        ...(status === "DELIVERED" && { deliveredAt: new Date() }),
      },
    });

    // Create a shipment event if status changes
    if (status) {
      const descriptions: Record<string, string> = {
        DELIVERED: deliverySignature
          ? `Delivered — ${deliverySignature}`
          : "Order delivered",
        OUT_FOR_DELIVERY: "Out for delivery",
        IN_TRANSIT: "In transit",
        PICKED_UP: "Picked up by driver",
        EXCEPTION: "Delivery exception — contact support",
      };

      await prisma.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          status,
          description: descriptions[status] ?? status.replace(/_/g, " ").toLowerCase(),
        },
      });
    }

    await prisma.auditEvent.create({
      data: {
        entityType: "Shipment",
        entityId: shipment.id,
        action: "updated",
        userId,
        metadata: { deliveryPhotoUrl, deliverySignature, status },
      },
    });

    return NextResponse.json({ shipment: updated });
  } catch (err) {
    console.error("Error updating shipment:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
