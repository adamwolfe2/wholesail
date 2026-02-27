import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getIntakeSubmissions } from "@/lib/db/intake";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") ?? "pending";

  let opts: { reviewed?: boolean; archived?: boolean } = {};
  if (filter === "pending") {
    opts = { reviewed: false, archived: false };
  } else if (filter === "reviewed") {
    opts = { reviewed: true, archived: false };
  } else if (filter === "archived") {
    opts = { archived: true };
  }

  try {
    const intakes = await getIntakeSubmissions(opts);
    const serialized = intakes.map((i) => ({
      ...i,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
      reviewedAt: i.reviewedAt?.toISOString() ?? null,
      archivedAt: i.archivedAt?.toISOString() ?? null,
    }));
    return NextResponse.json({ intakes: serialized });
  } catch (err) {
    console.error("[GET /api/admin/intakes]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
