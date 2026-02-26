import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  status: z.string().optional(),
  description: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // API key guard — ALWAYS enforced. Set TRACKING_API_KEY in env.
    const trackingKey = process.env.TRACKING_API_KEY;
    if (!trackingKey) {
      // Fail secure: if key is not configured, reject all requests.
      // This prevents accidental open access during deployment.
      return NextResponse.json(
        { error: "Tracking integration not configured" },
        { status: 503 }
      );
    }

    const providedKey = req.headers.get("x-tracking-key");
    if (providedKey !== trackingKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const shipment = await prisma.shipment.findUnique({ where: { id } });
    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = locationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { lat, lng, status, description } = parsed.data;

    const updatedShipment = await prisma.shipment.update({
      where: { id },
      data: {
        currentLat: lat,
        currentLng: lng,
        ...(status
          ? {
              status: status as
                | "PREPARING"
                | "PICKED_UP"
                | "IN_TRANSIT"
                | "OUT_FOR_DELIVERY"
                | "DELIVERED"
                | "EXCEPTION",
            }
          : {}),
      },
    });

    const event = await prisma.shipmentEvent.create({
      data: {
        shipmentId: id,
        status: status ?? shipment.status,
        description: description ?? "Location updated",
        lat,
        lng,
      },
    });

    return NextResponse.json({ shipment: updatedShipment, event }, { status: 201 });
  } catch (err) {
    console.error("Error updating shipment location:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
