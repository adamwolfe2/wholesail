import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;

    const events = await prisma.auditEvent.findMany({
      where: {
        entityType: "Product",
        entityId: id,
        action: "price_changed",
      },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const history = events.map((event) => {
      const meta = event.metadata as {
        oldPrice?: number;
        newPrice?: number;
        changedBy?: string;
      } | null;

      return {
        date: event.createdAt.toISOString(),
        price: meta?.newPrice ?? 0,
        oldPrice: meta?.oldPrice ?? null,
        changedBy: event.user?.name ?? event.user?.email ?? "Unknown",
      };
    });

    return NextResponse.json({ history });
  } catch (err) {
    console.error("Error fetching price history:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
