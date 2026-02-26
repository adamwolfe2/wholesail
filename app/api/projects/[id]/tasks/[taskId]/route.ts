import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
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
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId } = await params;

  try {
    const body = await req.json();
    const data = updateTaskSchema.parse(body);
    const task = await updateTask(taskId, data);
    return NextResponse.json(task);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    console.error("[tasks] Update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId } = await params;
  await deleteTask(taskId);
  return NextResponse.json({ success: true });
}
