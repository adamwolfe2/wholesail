import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { aiCallLimiter, checkRateLimit } from "@/lib/rate-limit";

const bulkUpdateSchema = z.object({
  productIds: z.array(z.string()).min(1).max(200),
  action: z.enum(["toggle_availability", "set_available", "set_unavailable", "assign_distributor", "delete"]),
  distributorOrgId: z.string().optional(),
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

    const { productIds, action, distributorOrgId } = parsed.data;
    let updated = 0;

    switch (action) {
      case "set_available": {
        const result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { available: true },
        });
        updated = result.count;
        break;
      }
      case "set_unavailable": {
        const result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { available: false },
        });
        updated = result.count;
        break;
      }
      case "assign_distributor": {
        if (!distributorOrgId) {
          return NextResponse.json(
            { error: "distributorOrgId required for assign_distributor action" },
            { status: 400 },
          );
        }
        const result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { distributorOrgId },
        });
        updated = result.count;
        break;
      }
      case "delete": {
        // Soft delete — mark unavailable
        const result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { available: false },
        });
        updated = result.count;
        break;
      }
    }

    await prisma.auditEvent.createMany({
      data: productIds.map((productId) => ({
        entityType: "Product",
        entityId: productId,
        action: `bulk_${action}`,
        userId,
        metadata: { bulkUpdate: true, action, ...(distributorOrgId ? { distributorOrgId } : {}) },
      })),
    });

    return NextResponse.json({ updated, action });
  } catch (error) {
    console.error("Error bulk updating products:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
