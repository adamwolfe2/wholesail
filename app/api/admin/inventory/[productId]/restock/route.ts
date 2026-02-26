import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { z } from "zod";

const restockSchema = z.object({
  quantity: z.number().int().positive(),
  expectedDate: z.string(), // ISO date string
  notes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { productId } = await params;

    const inventory = await prisma.inventoryLevel.findUnique({
      where: { productId },
    });
    if (!inventory) {
      return NextResponse.json(
        { error: "Inventory level not found for this product" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = restockSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const restock = await prisma.inventoryRestock.create({
      data: {
        inventoryId: inventory.id,
        quantity: parsed.data.quantity,
        expectedDate: new Date(parsed.data.expectedDate),
        notes: parsed.data.notes ?? null,
      },
    });

    return NextResponse.json({ restock }, { status: 201 });
  } catch (err) {
    console.error("Error creating restock:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
