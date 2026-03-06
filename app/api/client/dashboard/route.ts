import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ orders: [], topProducts: [], monthlyRevenue: [] });
    }

    const orgId = user.organizationId;

    // Fetch recent orders, all items (for top products), and monthly revenue in parallel
    const [recentOrders, allItems, orders] = await Promise.all([
      // Recent orders (last 10)
      prisma.order.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          items: { select: { id: true } },
        },
      }),

      // All order items for top products — cap at 500 to avoid OOM
      prisma.orderItem.findMany({
        where: { order: { organizationId: orgId, status: { not: "CANCELLED" } } },
        select: {
          name: true,
          quantity: true,
          total: true,
          order: {
            select: {
              createdAt: true,
            },
          },
        },
        orderBy: {
          order: { createdAt: "desc" },
        },
        take: 500,
      }),

      // All orders for monthly revenue (last 7 months)
      prisma.order.findMany({
        where: {
          organizationId: orgId,
          status: { not: "CANCELLED" },
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 7)),
          },
        },
        select: {
          total: true,
          createdAt: true,
        },
      }),
    ]);

    // Aggregate top products — track last order date and last quantity
    const productMap = new Map<
      string,
      { orders: number; revenue: number; lastOrderedAt: Date; lastQuantity: number }
    >();
    for (const item of allItems) {
      const existing = productMap.get(item.name);
      const itemDate = new Date(item.order.createdAt);
      if (!existing) {
        productMap.set(item.name, {
          orders: item.quantity,
          revenue: Number(item.total),
          lastOrderedAt: itemDate,
          lastQuantity: item.quantity,
        });
      } else {
        existing.orders += item.quantity;
        existing.revenue += Number(item.total);
        // allItems is ordered by order.createdAt desc, so first occurrence = most recent
        // We only update lastOrderedAt/lastQuantity if this is newer (shouldn't be needed but safe)
        if (itemDate > existing.lastOrderedAt) {
          existing.lastOrderedAt = itemDate;
          existing.lastQuantity = item.quantity;
        }
      }
    }

    const now = new Date();
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    const topProducts = Array.from(productMap.entries())
      .map(([name, data]) => ({
        name,
        orders: data.orders,
        revenue: Math.round(data.revenue),
        daysSinceLastOrder: Math.floor((now.getTime() - data.lastOrderedAt.getTime()) / MS_PER_DAY),
        lastQuantity: data.lastQuantity,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Aggregate monthly revenue
    const monthMap = new Map<string, number>();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (const order of orders) {
      const d = new Date(order.createdAt);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthMap.set(key, (monthMap.get(key) || 0) + Number(order.total));
    }

    // Build ordered list of last 7 months
    const monthlyRevenue: { month: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthlyRevenue.push({
        month: months[d.getMonth()],
        revenue: Math.round(monthMap.get(key) || 0),
      });
    }

    return NextResponse.json({
      orders: recentOrders.map((o) => ({
        id: o.orderNumber,
        date: o.createdAt,
        items: o.items.length,
        total: Number(o.total),
        status: o.status.toLowerCase(),
      })),
      topProducts,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Error fetching client dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
