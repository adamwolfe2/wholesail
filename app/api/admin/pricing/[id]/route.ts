import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  isActive: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const rule = await prisma.pricingRule.update({
      where: { id },
      data: { isActive: parsed.data.isActive },
    });

    return NextResponse.json({ rule });
  } catch (error) {
    console.error("Pricing rule update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    await prisma.pricingRule.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Pricing rule delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
