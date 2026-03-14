import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const url = new URL(req.url);
    const cursor = url.searchParams.get("cursor");
    const entityType = url.searchParams.get("entityType");
    const action = url.searchParams.get("action");
    const take = 50;

    const events = await prisma.auditEvent.findMany({
      where: {
        ...(entityType ? { entityType } : {}),
        ...(action ? { action: { contains: action } } : {}),
      },
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const nextCursor = events.length === take ? events[events.length - 1].id : null;

    // Get distinct entity types and actions for filter dropdowns (bounded)
    const [entityTypes, actions] = await Promise.all([
      prisma.auditEvent.findMany({ distinct: ["entityType"], select: { entityType: true }, take: 100 }),
      prisma.auditEvent.findMany({ distinct: ["action"], select: { action: true }, take: 200 }),
    ]);

    return NextResponse.json({
      events,
      nextCursor,
      filters: {
        entityTypes: entityTypes.map((e) => e.entityType),
        actions: actions.map((a) => a.action),
      },
    });
  } catch (error) {
    console.error("Error fetching audit log:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
