import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import type { OrgTier } from "@prisma/client";

const createRuleSchema = z.object({
  tier: z.enum(["NEW", "REPEAT", "VIP"]),
  category: z.string().nullable().optional(),
  discountPct: z.number().min(0).max(100),
});

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  try {

    const body = await req.json();
    const parsed = createRuleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { tier, category, discountPct } = parsed.data;

    // Treat "All Categories" sentinel as null
    const categoryValue =
      category === "All Categories" || category === "" || category == null
        ? null
        : category;

    const rule = await prisma.pricingRule.create({
      data: {
        tier: tier as OrgTier,
        category: categoryValue,
        discountPct,
      },
    });

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error: unknown) {
    // Unique constraint violation
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A rule for this tier + category combination already exists." },
        { status: 409 }
      );
    }
    console.error("Pricing rule create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
