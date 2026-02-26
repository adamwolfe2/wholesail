import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const orders = await prisma.order.findMany({
      where: {
        invoice: null, // No invoice created yet
      },
      include: {
        organization: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching uninvoiced orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
