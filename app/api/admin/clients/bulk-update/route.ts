import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { aiCallLimiter, checkRateLimit } from "@/lib/rate-limit";

const bulkUpdateSchema = z.object({
  orgIds: z.array(z.string()).min(1).max(200),
  action: z.enum(["change_tier"]),
  tier: z.enum(["NEW", "REPEAT", "VIP"]).optional(),
});

export async function POST(req: NextRequest) {
  const { userId, error: authError } = await requireAdmin();
  if (authError) return authError;

  const rl = await checkRateLimit(aiCallLimiter, userId);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = bulkUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { orgIds, action, tier } = parsed.data;
    let updated = 0;

    switch (action) {
      case "change_tier": {
        if (!tier) {
          return NextResponse.json(
            { error: "tier required for change_tier action" },
            { status: 400 },
          );
        }
        const result = await prisma.organization.updateMany({
          where: { id: { in: orgIds } },
          data: { tier },
        });
        updated = result.count;
        break;
      }
    }

    await prisma.auditEvent.createMany({
      data: orgIds.map((orgId) => ({
        entityType: "Organization",
        entityId: orgId,
        action: `bulk_${action}`,
        userId,
        metadata: { bulkUpdate: true, action, ...(tier ? { tier } : {}) },
      })),
    });

    return NextResponse.json({ updated, action });
  } catch (error) {
    console.error("Error bulk updating clients:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
