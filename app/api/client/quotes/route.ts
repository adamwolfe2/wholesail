import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user's organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ quotes: [] });
    }

    const quotes = await prisma.quote.findMany({
      where: { organizationId: user.organizationId },
      include: {
        rep: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true, unit: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error("Error fetching client quotes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
