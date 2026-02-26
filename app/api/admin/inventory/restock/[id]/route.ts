import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;

    const restock = await prisma.inventoryRestock.findUnique({
      where: { id },
      include: { inventory: true },
    });

    if (!restock) {
      return NextResponse.json({ error: "Restock not found" }, { status: 404 });
    }

    if (restock.arrivedAt) {
      return NextResponse.json(
        { error: "Restock has already been marked as arrived" },
        { status: 409 }
      );
    }

    // Mark as arrived and add quantity to on-hand in a transaction
    const [updatedRestock, updatedInventory] = await prisma.$transaction([
      prisma.inventoryRestock.update({
        where: { id },
        data: { arrivedAt: new Date() },
      }),
      prisma.inventoryLevel.update({
        where: { id: restock.inventoryId },
        data: { quantityOnHand: { increment: restock.quantity } },
      }),
    ]);

    return NextResponse.json({ restock: updatedRestock, inventory: updatedInventory });
  } catch (err) {
    console.error("Error marking restock as arrived:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
