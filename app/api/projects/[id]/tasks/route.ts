import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
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
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const data = taskSchema.parse(body);
    const task = await addTask(id, data);
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    console.error("[tasks] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
