import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  key: z.string(),
  value: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { key, value } = schema.parse(body);

  const project = await prisma.project.findUnique({
    where: { id },
    select: { buildChecklist: true },
  });
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const current =
    typeof project.buildChecklist === "object" && project.buildChecklist !== null
      ? (project.buildChecklist as Record<string, boolean>)
      : {};

  const updated = await prisma.project.update({
    where: { id },
    data: { buildChecklist: { ...current, [key]: value } },
    select: { buildChecklist: true },
  });

  return NextResponse.json({ buildChecklist: updated.buildChecklist });
}
