import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { addTask } from "@/lib/db/projects";
import { z } from "zod";

// GET — return all tasks for a project, ordered by phase then createdAt
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id, deletedAt: null },
    select: { id: true },
  });
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const tasks = await prisma.projectTask.findMany({
    where: { projectId: id },
    orderBy: [{ phase: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ tasks });
}

// POST — create a new task
const createSchema = z.object({
  label: z.string().min(1).max(200),
  phase: z.number().int().min(0).max(5),
  description: z.string().max(1000).optional(),
  externalUrl: z.string().url().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();

  let data: z.infer<typeof createSchema>;
  try {
    data = createSchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
    }
    throw err;
  }

  const project = await prisma.project.findUnique({
    where: { id, deletedAt: null },
    select: { id: true },
  });
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const task = await addTask(id, data);
  return NextResponse.json({ task }, { status: 201 });
}
