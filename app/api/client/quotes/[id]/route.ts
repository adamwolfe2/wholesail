import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  action: z.enum(["accept", "decline"]),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        rep: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true, unit: true } },
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (quote.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ quote });
  } catch (error) {
    console.error("Error fetching client quote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the quote belongs to the user's org
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const quote = await prisma.quote.findUnique({
      where: { id },
      select: { organizationId: true, status: true },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (quote.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const newStatus = parsed.data.action === "accept" ? "ACCEPTED" : "DECLINED";

    const updated = await prisma.quote.update({
      where: { id },
      data: {
        status: newStatus,
        ...(newStatus === "ACCEPTED" ? { acceptedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ quote: updated });
  } catch (error) {
    console.error("Error updating client quote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
