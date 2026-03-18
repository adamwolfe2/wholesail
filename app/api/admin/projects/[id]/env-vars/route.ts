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

  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
    }
    throw err;
  }

  const { key, status } = data;

  const project = await prisma.project.findUnique({
    where: { id, deletedAt: null },
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
