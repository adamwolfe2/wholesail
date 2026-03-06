import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrRep } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createTaskSchema = z.object({
  repId: z.string().min(1),
  organizationId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
});

export async function GET(req: NextRequest) {
  const { error } = await requireAdminOrRep();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const repId = searchParams.get("repId") ?? undefined;
    const priority = searchParams.get("priority") ?? undefined;
    const overdue = searchParams.get("overdue") === "true";

    const now = new Date();

    const tasks = await prisma.repTask.findMany({
      where: {
        completedAt: null,
        ...(repId ? { repId } : {}),
        ...(priority ? { priority } : {}),
        ...(overdue ? { dueDate: { lt: now } } : {}),
      },
      include: {
        rep: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true } },
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }, { createdAt: "desc" }],
      take: 200,
    });

    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("Error fetching rep tasks:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdminOrRep();
  if (authError) return authError;

  try {

    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid task data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const task = await prisma.repTask.create({
      data: {
        repId: data.repId,
        organizationId: data.organizationId ?? null,
        title: data.title,
        description: data.description ?? null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Error creating rep task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
