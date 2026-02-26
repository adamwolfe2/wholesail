import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";

const tierSchema = z.object({
  tier: z.enum(["NEW", "REPEAT", "VIP"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = tierSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const org = await prisma.organization.update({
      where: { id },
      data: { tier: parsed.data.tier },
    });

    await prisma.auditEvent.create({
      data: {
        entityType: "Organization",
        entityId: id,
        action: "tier_changed",
        userId,
        metadata: { tier: parsed.data.tier },
      },
    });

    return NextResponse.json({ organization: org });
  } catch (err) {
    console.error("Failed to update tier:", err);
    return NextResponse.json(
      { error: "Failed to update tier" },
      { status: 500 }
    );
  }
}
