import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { captureWithContext } from "@/lib/sentry";
import { z } from "zod";
import { addTask } from "@/lib/db/projects";

const taskSchema = z.object({
  label: z.string().min(1),
  phase: z.number().min(1).max(15),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const data = taskSchema.parse(body);
    const task = await addTask(id, data);
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    captureWithContext(err instanceof Error ? err : new Error("Unknown error"), {
      route: "POST /api/projects/[id]/tasks",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
