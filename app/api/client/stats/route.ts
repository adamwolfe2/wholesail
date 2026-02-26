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
      return NextResponse.json({
        orderCount: 0,
        totalSpent: 0,
        lastOrderDate: null,
      });
    }

    const [orderCount, totalSpent, lastOrder] = await Promise.all([
      prisma.order.count({
        where: { organizationId: user.organizationId },
      }),
      prisma.order.aggregate({
        where: {
          organizationId: user.organizationId,
          status: { not: "CANCELLED" },
        },
        _sum: { total: true },
      }),
      prisma.order.findFirst({
        where: { organizationId: user.organizationId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

    return NextResponse.json({
      orderCount,
      totalSpent: Number(totalSpent._sum.total ?? 0),
      lastOrderDate: lastOrder?.createdAt ?? null,
    });
  } catch (error) {
    console.error("Error fetching client stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
