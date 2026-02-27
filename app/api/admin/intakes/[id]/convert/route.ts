import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getIntakeSubmissionById } from "@/lib/db/intake";
import { convertIntakeToProject } from "@/lib/db/projects";
import { notifyClientStatusChange } from "@/lib/email/notifications";

export async function POST(
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
    if (intake.project) {
      return NextResponse.json(
        { error: "Intake already converted", projectId: intake.project.id },
        { status: 409 }
      );
    }

    const project = await convertIntakeToProject(id);

    // Fire-and-forget: notify client their project has started (resend may be unconfigured)
    const notifyPromise = notifyClientStatusChange({
      contactName: intake.contactName,
      contactEmail: intake.contactEmail,
      companyName: intake.companyName,
      newStatus: "INQUIRY",
      currentPhase: 0,
      message: "Your portal build has been kicked off. We'll be in touch shortly.",
    });
    if (notifyPromise) {
      notifyPromise.catch((err: unknown) =>
        console.error("[convert] notify email error:", err)
      );
    }

    return NextResponse.json({ projectId: project.id });
  } catch (err) {
    console.error("[POST /api/admin/intakes/[id]/convert]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
