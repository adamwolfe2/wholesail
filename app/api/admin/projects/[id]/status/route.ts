import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { updateProject } from "@/lib/db/projects";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["INQUIRY", "ONBOARDING", "BUILDING", "REVIEW", "LIVE", "CHURNED"]).optional(),
  targetLaunchDate: z.string().datetime().optional(),
  assignedTo: z.string().max(100).nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
    }
    throw err;
  }

  const project = await prisma.project.findUnique({ where: { id, deletedAt: null } });
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.targetLaunchDate !== undefined) updateData.targetLaunchDate = new Date(data.targetLaunchDate);
  if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;

  const updated = await updateProject(id, updateData);
  return NextResponse.json({
    status: updated.status,
    targetLaunchDate: updated.targetLaunchDate,
    assignedTo: updated.assignedTo,
  });
}
