import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";

const bulkStatusSchema = z.object({
  orderIds: z.array(z.string()).min(1),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export async function PATCH(req: NextRequest) {
  const { userId, error: authError } = await requireAdmin();
  if (authError) return authError;

  try {

    const body = await req.json();
    const parsed = bulkStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { orderIds, status } = parsed.data;

    // Update all orders
    const result = await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: {
        status,
        ...(status === "CONFIRMED" ? { paidAt: new Date() } : {}),
      },
    });

    // Create audit events for each
    await prisma.auditEvent.createMany({
      data: orderIds.map((orderId) => ({
        entityType: "Order",
        entityId: orderId,
        action: "bulk_status_changed",
        userId,
        metadata: { newStatus: status, bulkUpdate: true },
      })),
    });

    return NextResponse.json({
      updated: result.count,
      status,
    });
  } catch (error) {
    console.error("Error bulk updating orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
