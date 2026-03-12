import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { convertIntakeToProject } from "@/lib/db/projects";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  // The [id] here is the intake submission ID
  const { id: intakeId } = await params;

  try {
    const project = await convertIntakeToProject(intakeId);
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[convert] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
