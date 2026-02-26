import { prisma } from "@/lib/db";
import { PricingClient } from "./pricing-client";

export default async function AdminPricingPage() {
  let rules: {
    id: string;
    tier: "NEW" | "REPEAT" | "VIP";
    category: string | null;
    discountPct: number;
    isActive: boolean;
  }[] = [];

  try {
    const dbRules = await prisma.pricingRule.findMany({
      orderBy: [{ tier: "asc" }, { category: "asc" }],
    });

    rules = dbRules.map((r) => ({
      id: r.id,
      tier: r.tier as "NEW" | "REPEAT" | "VIP",
      category: r.category,
      discountPct: Number(r.discountPct),
      isActive: r.isActive,
    }));
  } catch {
    // DB may be empty
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
          Pricing Rules
        </h2>
        <p className="text-xs text-[#0A0A0A]/50">
          {rules.length} rule{rules.length !== 1 ? "s" : ""} configured
        </p>
      </div>

      <p className="text-sm text-[#0A0A0A]/60 max-w-2xl">
        Configure discount percentages by client tier and product category. A
        specific category rule always takes precedence over an "All Categories"
        rule for the same tier.
      </p>

      <PricingClient rules={rules} />
    </div>
  );
}
