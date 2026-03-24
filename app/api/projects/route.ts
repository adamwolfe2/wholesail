import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { captureWithContext } from "@/lib/sentry";
import { z } from "zod";
import { getProjects, createProject } from "@/lib/db/projects";
import { getIntakeSubmissions } from "@/lib/db/intake";
import type { ProjectStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const status = req.nextUrl.searchParams.get("status") as ProjectStatus | null;
  const search = req.nextUrl.searchParams.get("search") || undefined;
  const includeIntakes = req.nextUrl.searchParams.get("intakes") === "true";

  const projects = await getProjects({
    ...(status ? { status } : {}),
    ...(search ? { search } : {}),
  });

  let intakes = null;
  if (includeIntakes) {
    intakes = await getIntakeSubmissions({ reviewed: false, archived: false });
  }

  return NextResponse.json({ projects, intakes });
}

const createProjectSchema = z.object({
  company: z.string().min(1),
  shortName: z.string().min(1),
  industry: z.string().min(1),
  website: z.string().optional(),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  contactRole: z.string().optional(),
  enabledFeatures: z.array(z.string()).default([]),
  contractValue: z.number().default(0),
  retainer: z.number().default(0),
  intakeId: z.string().optional(),
});

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const data = createProjectSchema.parse(body);

    const project = await createProject(data);
    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      );
    }
    captureWithContext(err instanceof Error ? err : new Error("Unknown error"), {
      route: "POST /api/projects",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
