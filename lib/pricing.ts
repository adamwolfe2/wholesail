import { prisma } from "@/lib/db";

/**
 * Returns the best discount percentage for a given org + category combination.
 *
 * Resolution order:
 *   1. Active rule matching org tier + specific category (highest specificity)
 *   2. Active rule matching org tier + null category  (applies to all categories)
 *   3. 0 (no discount)
 */
export async function getDiscountForOrg(
  orgId: string,
  category: string
): Promise<number> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { tier: true },
    });

    if (!org) return 0;

    const rules = await prisma.pricingRule.findMany({
      where: {
        tier: org.tier,
        isActive: true,
        OR: [
          { category: category },
          { category: null },
        ],
      },
      orderBy: { discountPct: "desc" },
    });

    if (rules.length === 0) return 0;

    // Specific category rule takes precedence over all-categories rule
    const specificRule = rules.find((r) => r.category === category);
    if (specificRule) return Number(specificRule.discountPct);

    const catchAllRule = rules.find((r) => r.category === null);
    if (catchAllRule) return Number(catchAllRule.discountPct);

    return 0;
  } catch {
    return 0;
  }
}
