import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ orders: [], hasMore: false });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor") ?? undefined;
    const statusFilter = searchParams.get("status") ?? undefined;

    const orders = await prisma.order.findMany({
      where: {
        organizationId: user.organizationId,
        ...(statusFilter ? { status: statusFilter as never } : {}),
      },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            unitPrice: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1, // fetch one extra to determine hasMore
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    const hasMore = orders.length > PAGE_SIZE;
    const page = hasMore ? orders.slice(0, PAGE_SIZE) : orders;
    const nextCursor = hasMore ? page[page.length - 1].id : null;

    return NextResponse.json({ orders: page, hasMore, nextCursor });
  } catch (error) {
    console.error("Error fetching client orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
