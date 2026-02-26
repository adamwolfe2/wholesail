import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminOrRep } from "@/lib/auth/require-admin";
import { z } from "zod";

const patchSchema = z.object({
  action: z.enum(["complete", "reopen", "delete"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminOrRep();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (parsed.data.action === "complete") {
      const task = await prisma.repTask.update({
        where: { id },
        data: { completedAt: new Date() },
      });
      return NextResponse.json({ task });
    }

    if (parsed.data.action === "reopen") {
      const task = await prisma.repTask.update({
        where: { id },
        data: { completedAt: null },
      });
      return NextResponse.json({ task });
    }

    if (parsed.data.action === "delete") {
      await prisma.repTask.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Error patching rep task:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminOrRep();
  if (error) return error;

  try {
    const { id } = await params;
    await prisma.repTask.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting rep task:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
