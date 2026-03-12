import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { addNote } from "@/lib/db/projects";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  text: z.string().min(1),
  type: z.enum(["NOTE", "UPDATE", "MILESTONE"]).optional(),
});

export async function POST(
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

  const { text, type } = data;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const note = await addNote(id, { text, type });
  return NextResponse.json({ note }, { status: 201 });
}
