import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  available: z.boolean().optional(),
  description: z.string().optional(),
  unit: z.string().optional(),
  category: z.string().optional(),
  minimumOrder: z.number().int().positive().optional().transform(String),
  marketRate: z.boolean().optional(),
  prepayRequired: z.boolean().optional(),
  coldChainRequired: z.boolean().optional(),
  image: z.string().url().nullable().optional().or(z.literal("").transform(() => null)),
  distributorOrgId: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { id } = await params;

    // Fetch current price before update to detect price changes
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { price: true },
    });

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
    });

    // Write AuditEvent if price changed
    if (
      existing &&
      parsed.data.price !== undefined &&
      Number(existing.price) !== Number(parsed.data.price)
    ) {
      await prisma.auditEvent.create({
        data: {
          entityType: "Product",
          entityId: id,
          action: "price_changed",
          userId: userId ?? undefined,
          metadata: {
            oldPrice: Number(existing.price),
            newPrice: Number(parsed.data.price),
            changedBy: userId,
          },
        },
      });
    }

    return NextResponse.json({ product });
  } catch (err) {
    console.error("Error updating product:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  void req;

  try {
    const { id } = await params;

    // Soft delete - just mark as unavailable
    await prisma.product.update({
      where: { id },
      data: { available: false },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting product:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
