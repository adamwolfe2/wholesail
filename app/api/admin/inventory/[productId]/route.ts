import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateInventorySchema = z.object({
  quantityOnHand: z.number().int().min(0).optional(),
  quantityReserved: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
});

// Create inventory level for a product that doesn't have one
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  try {

    const { productId } = await params;

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if inventory level already exists
    const existing = await prisma.inventoryLevel.findUnique({
      where: { productId },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Inventory level already exists for this product" },
        { status: 409 }
      );
    }

    const body = await req.json();
    const parsed = updateInventorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const inventory = await prisma.inventoryLevel.create({
      data: {
        productId,
        quantityOnHand: parsed.data.quantityOnHand ?? 0,
        quantityReserved: parsed.data.quantityReserved ?? 0,
        lowStockThreshold: parsed.data.lowStockThreshold ?? 5,
      },
    });

    return NextResponse.json({ inventory }, { status: 201 });
  } catch (error) {
    console.error("Error creating inventory level:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  try {

    const { productId } = await params;

    const body = await req.json();
    const parsed = updateInventorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const inventory = await prisma.inventoryLevel.update({
      where: { productId },
      data: {
        ...(parsed.data.quantityOnHand !== undefined
          ? { quantityOnHand: parsed.data.quantityOnHand }
          : {}),
        ...(parsed.data.quantityReserved !== undefined
          ? { quantityReserved: parsed.data.quantityReserved }
          : {}),
        ...(parsed.data.lowStockThreshold !== undefined
          ? { lowStockThreshold: parsed.data.lowStockThreshold }
          : {}),
      },
    });

    return NextResponse.json({ inventory });
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
