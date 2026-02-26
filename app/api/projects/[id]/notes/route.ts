import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
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
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const data = noteSchema.parse(body);
    const note = await addNote(id, data);
    return NextResponse.json(note, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    console.error("[notes] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
