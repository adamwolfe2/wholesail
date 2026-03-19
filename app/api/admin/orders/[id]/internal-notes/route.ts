import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrRep } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";

const notesSchema = z.object({
  notes: z.string(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, error } = await requireAdminOrRep();
    if (error) return error;

    const body = await req.json();
    const parsed = notesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { internalNotes: parsed.data.notes || null },
      select: {
        id: true,
        orderNumber: true,
        internalNotes: true,
      },
    });

    await prisma.auditEvent.create({
      data: {
        entityType: "Order",
        entityId: id,
        action: "internal_notes_updated",
        userId,
        metadata: { hasNotes: !!parsed.data.notes },
      },
    });

    return NextResponse.json({ order: updated });
  } catch (error) {
    const { captureWithContext } = await import("@/lib/sentry");
    captureWithContext(error, { route: "admin/orders/[id]/internal-notes", action: "patch" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
