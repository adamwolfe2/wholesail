import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { deleteNote } from "@/lib/db/projects";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { noteId } = await params;
  await deleteNote(noteId);
  return NextResponse.json({ success: true });
}
