import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { captureWithContext } from "@/lib/sentry";
import { z } from "zod";
import { addNote } from "@/lib/db/projects";

const noteSchema = z.object({
  text: z.string().min(1),
  type: z.enum(["NOTE", "UPDATE", "MILESTONE"]).default("NOTE"),
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
    const data = noteSchema.parse(body);
    const note = await addNote(id, data);
    return NextResponse.json(note, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    captureWithContext(err instanceof Error ? err : new Error("Unknown error"), {
      route: "POST /api/projects/[id]/notes",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
