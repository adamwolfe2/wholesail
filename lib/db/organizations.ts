import { unstable_cache } from "next/cache";
import { prisma } from "./index";

export const getOrganizationById = unstable_cache(
  async (id: string) =>
    prisma.organization.findUnique({
      where: { id },
      include: {
        addresses: true,
        members: true,
      },
    }),
  ["org-by-id"],
  { revalidate: 3600, tags: ["organizations"] }
);

export const getOrganizationByUserId = unstable_cache(
  async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: {
          include: {
            addresses: true,
          },
        },
      },
    });
    return user?.organization ?? null;
  },
  ["org-by-user-id"],
  { revalidate: 300, tags: ["organizations"] }
);

export async function getAllOrganizations() {
  return prisma.organization.findMany({
    include: {
      _count: { select: { orders: true, members: true } },
    },
    orderBy: { name: "asc" },
    take: 1000,
  });
}

export const getOrganizationStats = unstable_cache(
  async (organizationId: string) => {
    const [orderCount, totalSpent, lastOrder] = await Promise.all([
      prisma.order.count({ where: { organizationId } }),
      prisma.order.aggregate({
        where: { organizationId, status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
      prisma.order.findFirst({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true, orderNumber: true },
      }),
    ]);

    return {
      orderCount,
      totalSpent: totalSpent._sum.total ?? 0,
      lastOrderDate: lastOrder?.createdAt ?? null,
      lastOrderNumber: lastOrder?.orderNumber ?? null,
    };
  },
  ["org-stats"],
  { revalidate: 3600, tags: ["organizations"] }
);

export const getOrgTierProgress = unstable_cache(
  async (organizationId: string) => {
    const TIER_THRESHOLDS = {
      NEW: { label: "NEW", min: 0, max: 2500 },
      REPEAT: { label: "REPEAT", min: 2500, max: 10000 },
      VIP: { label: "VIP", min: 10000, max: null },
    };

    const [org, spendResult] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: organizationId },
        select: { tier: true, name: true },
      }),
      prisma.order.aggregate({
        where: { organizationId, status: { notIn: ["CANCELLED", "PENDING"] } },
        _sum: { total: true },
      }),
    ]);

    const totalSpend = Number(spendResult._sum.total ?? 0);
    const currentTier = org?.tier ?? "NEW";

    const thresholds = TIER_THRESHOLDS[currentTier as keyof typeof TIER_THRESHOLDS];
    const nextTier =
      currentTier === "NEW" ? "REPEAT" : currentTier === "REPEAT" ? "VIP" : null;
    const nextThreshold = thresholds.max;
    const prevThreshold = thresholds.min;

    const progress =
      nextThreshold !== null
        ? Math.min(
            (totalSpend - prevThreshold) / (nextThreshold - prevThreshold),
            1
          )
        : 1;
    const remaining = nextThreshold !== null ? Math.max(nextThreshold - totalSpend, 0) : 0;

    // Fetch discount preview for current and next tier
    const pricingRules = await prisma.pricingRule.findMany({
      where: { isActive: true, tier: { in: ["NEW", "REPEAT", "VIP"] } },
      select: { tier: true, category: true, discountPct: true },
    });

    const nextTierDiscounts = nextTier
      ? pricingRules
          .filter((r) => r.tier === nextTier && r.category !== null)
          .map((r) => ({
            category: r.category!,
            discountPct: Number(r.discountPct),
          }))
          .slice(0, 3)
      : [];

    return {
      currentTier,
      nextTier,
      totalSpend,
      nextThreshold,
      prevThreshold,
      progress: Math.max(0, progress),
      remaining,
      nextTierDiscounts,
    };
  },
  ["org-tier-progress"],
  { revalidate: 300, tags: ["organizations"] }
);
