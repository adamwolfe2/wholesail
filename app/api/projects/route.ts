import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { z } from "zod";
import { getProjects, createProject } from "@/lib/db/projects";
import { getIntakeSubmissions } from "@/lib/db/intake";
import type { ProjectStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
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
    console.error("[projects] Create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
