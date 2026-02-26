import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// Tier thresholds (must match lib/tier-upgrade.ts)
const TIER_THRESHOLDS = {
  NEW: 0,
  REPEAT: 5000,
  VIP: 50000,
} as const;

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        organizationId: true,
        organization: {
          select: {
            tier: true,
          },
        },
      },
    });

    if (!user?.organizationId || !user.organization) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { tier } = user.organization;

    // Fetch lifetime spend
    const result = await prisma.order.aggregate({
      where: {
        organizationId: user.organizationId,
        status: { not: "CANCELLED" },
      },
      _sum: { total: true },
    });
    const lifetimeSpend = Number(result._sum.total ?? 0);

    // Fetch pricing rules for their tier
    const discountRules = await prisma.pricingRule.findMany({
      where: { tier, isActive: true },
      select: { category: true, discountPct: true },
      orderBy: { category: "asc" },
    });

    const discounts = discountRules.map((r) => ({
      category: r.category ?? "All Categories",
      discountPct: Number(r.discountPct),
    }));

    // Determine next tier and spend to next tier
    let nextTier: "REPEAT" | "VIP" | null = null;
    let spendToNextTier: number | null = null;

    if (tier === "NEW") {
      nextTier = "REPEAT";
      spendToNextTier = Math.max(0, TIER_THRESHOLDS.REPEAT - lifetimeSpend);
    } else if (tier === "REPEAT") {
      nextTier = "VIP";
      spendToNextTier = Math.max(0, TIER_THRESHOLDS.VIP - lifetimeSpend);
    }
    // VIP = no next tier

    return NextResponse.json({
      tier,
      lifetimeSpend,
      discounts,
      nextTier,
      spendToNextTier,
    });
  } catch (error) {
    console.error("Error fetching pricing tier:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
