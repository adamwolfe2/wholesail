import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getIntakeSubmissionById } from "@/lib/db/intake";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const intake = await getIntakeSubmissionById(id);
    if (!intake) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
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
    console.error("[GET /api/admin/intakes/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
