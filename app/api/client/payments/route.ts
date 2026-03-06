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
      return NextResponse.json({ payments: [] });
    }

    const payments = await prisma.payment.findMany({
      where: {
        order: { organizationId: user.organizationId },
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            invoice: { select: { invoiceNumber: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
