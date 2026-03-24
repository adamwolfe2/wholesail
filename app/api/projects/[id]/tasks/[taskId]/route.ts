import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { captureWithContext } from "@/lib/sentry";
import { z } from "zod";
import { updateTask, deleteTask } from "@/lib/db/projects";

const updateTaskSchema = z.object({
  completed: z.boolean().optional(),
  label: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { taskId } = await params;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const data = updateTaskSchema.parse(body);
    const task = await updateTask(taskId, data);
    return NextResponse.json(task);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    captureWithContext(err instanceof Error ? err : new Error("Unknown error"), {
      route: "PATCH /api/projects/[id]/tasks/[taskId]",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { taskId } = await params;
  await deleteTask(taskId);
  return NextResponse.json({ success: true });
}
