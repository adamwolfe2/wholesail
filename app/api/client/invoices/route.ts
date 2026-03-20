import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Math.min(Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10)), 100);
    const take = 50;
    const skip = (page - 1) * take;
    const statusFilter = url.searchParams.get("status");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ invoices: [], total: 0, page, pages: 0 });
    }

    const where: Record<string, unknown> = { organizationId: user.organizationId };
    if (statusFilter === "outstanding") {
      where.status = { in: ["PENDING", "OVERDUE"] };
    } else if (statusFilter) {
      where.status = statusFilter;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          order: {
            include: {
              items: {
                select: {
                  id: true,
                  name: true,
                  quantity: true,
                  unitPrice: true,
                  total: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      invoices,
      total,
      page,
      pages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
