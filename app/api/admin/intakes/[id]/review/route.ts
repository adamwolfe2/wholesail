import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { markIntakeReviewed } from "@/lib/db/intake";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const intake = await markIntakeReviewed(id);
    return NextResponse.json({
      intake: {
        ...intake,
        createdAt: intake.createdAt.toISOString(),
        updatedAt: intake.updatedAt.toISOString(),
        reviewedAt: intake.reviewedAt?.toISOString() ?? null,
        archivedAt: intake.archivedAt?.toISOString() ?? null,
      },
    });
  } catch (err) {
    console.error("[PATCH /api/admin/intakes/[id]/review]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
