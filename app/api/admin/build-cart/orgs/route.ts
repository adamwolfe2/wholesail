import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminOrRep } from "@/lib/auth/require-admin";

export async function GET() {
  try {
    const { error: authError } = await requireAdminOrRep();
    if (authError) return authError;

    const orgs = await prisma.organization.findMany({
      select: { id: true, name: true, tier: true },
      orderBy: { name: "asc" },
      take: 2000,
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
