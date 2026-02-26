import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the user has admin or rep role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || !["ADMIN", "SALES_REP", "OPS"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orgs = await prisma.organization.findMany({
      select: { id: true, name: true, tier: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ orgs });
  } catch (error) {
    console.error("Error fetching orgs for build-cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
