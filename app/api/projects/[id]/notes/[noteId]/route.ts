import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { deleteNote } from "@/lib/db/projects";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { noteId } = await params;
  await deleteNote(noteId);
  return NextResponse.json({ success: true });
}
