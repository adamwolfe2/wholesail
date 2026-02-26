import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrRep } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { error: authError } = await requireAdminOrRep();
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  if (q.trim().length < 2) {
    return NextResponse.json({ organizations: [], orders: [], invoices: [] });
  }

  try {
    const [organizations, orders, invoices] = await Promise.all([
      prisma.organization.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, email: true, tier: true },
        take: 5,
      }),

      prisma.order.findMany({
        where: {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" } },
            { status: { equals: q.toUpperCase() as never } },
          ],
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          organization: { select: { name: true } },
        },
        take: 5,
      }),

      prisma.invoice.findMany({
        where: {
          invoiceNumber: { contains: q, mode: "insensitive" },
        },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          organization: { select: { name: true } },
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({ organizations, orders, invoices });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
