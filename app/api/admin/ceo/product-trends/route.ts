import { NextResponse } from "next/server";
import { requireAdminOrRep } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";

// GET /api/admin/ceo/product-trends
// Returns top 5 products by all-time revenue with monthly revenue for last 6 months
export async function GET() {
  const { error } = await requireAdminOrRep();
  if (error) return error;

  const now = new Date();
  const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // Build the 6 month labels (oldest → newest)
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${monthLabels[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`
    );
  }

  try {
    // Step 1: Get top 5 products by all-time revenue
    const topProductGroups = await prisma.orderItem.groupBy({
      by: ["productId", "name"],
      where: {
        order: { status: { not: "CANCELLED" } },
      },
      _sum: { total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    });

    if (topProductGroups.length === 0) {
      return NextResponse.json({ products: [], months, data: [] });
    }

    const productNames = topProductGroups.map((p) => p.name);

    // Step 2: For each of the last 6 months, get revenue per product
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const allItems = await prisma.orderItem.findMany({
      where: {
        productId: { in: topProductGroups.map((p) => p.productId) },
        order: {
          status: { not: "CANCELLED" },
          createdAt: { gte: sixMonthsAgo },
        },
      },
      select: {
        name: true,
        total: true,
        order: { select: { createdAt: true } },
      },
      take: 10000,
    });

    // Step 3: Aggregate into { month: string, [productName]: number }[]
    const monthDataMap = new Map<string, Record<string, number>>();

    // Initialize all months with 0 for all products
    for (const month of months) {
      const row: Record<string, number> = { month: 0 };
      for (const name of productNames) {
        row[name] = 0;
      }
      monthDataMap.set(month, row);
    }

    for (const item of allItems) {
      const d = new Date(item.order.createdAt);
      const key = `${monthLabels[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
      const row = monthDataMap.get(key);
      if (row && productNames.includes(item.name)) {
        row[item.name] = (row[item.name] ?? 0) + Number(item.total);
      }
    }

    // Build final data array
    const data = months.map((month) => {
      const row = monthDataMap.get(month) ?? {};
      const entry: Record<string, number | string> = { month };
      for (const name of productNames) {
        entry[name] = Math.round((row[name] ?? 0) * 100) / 100;
      }
      return entry;
    });

    return NextResponse.json({ products: productNames, months, data });
  } catch {
    return NextResponse.json({ products: [], months, data: [] });
  }
}
