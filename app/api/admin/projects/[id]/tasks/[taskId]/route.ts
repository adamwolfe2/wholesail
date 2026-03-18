import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { updateTask } from "@/lib/db/projects";
import { prisma } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  completed: z.boolean().optional(),
  label: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id, taskId } = await params;
  const body = await req.json();

  let data: z.infer<typeof patchSchema>;
  try {
    data = patchSchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
    }
    throw err;
  }

  // Verify task belongs to this project
  const task = await prisma.projectTask.findFirst({
    where: { id: taskId, projectId: id },
  });
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const updated = await updateTask(taskId, data);
  return NextResponse.json({ task: updated });
}
