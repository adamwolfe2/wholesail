import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  key: z.string(),
  status: z.enum(["configured", "pending", "missing"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const { key, status } = schema.parse(body);

  const project = await prisma.project.findUnique({
    where: { id },
    select: { envVars: true },
  });
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const current =
    typeof project.envVars === "object" && project.envVars !== null
      ? (project.envVars as Record<string, string>)
      : {};

  const updated = await prisma.project.update({
    where: { id },
    data: { envVars: { ...current, [key]: status } },
    select: { envVars: true },
  });

  return NextResponse.json({ envVars: updated.envVars });
}
