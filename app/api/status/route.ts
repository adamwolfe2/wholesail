import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getProjectByEmail } from "@/lib/db/projects";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = req.nextUrl.searchParams.get("email")?.trim();

  if (!email) {
    return NextResponse.json(
      { error: "Email parameter required" },
      { status: 400 }
    );
  }

  const project = await getProjectByEmail(email);

  if (!project) {
    return NextResponse.json(
      { error: "No project found for this email" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: project.id,
    company: project.company,
    shortName: project.shortName,
    status: project.status,
    currentPhase: project.currentPhase,
    domain: project.domain,
    customDomain: project.customDomain,
    startDate: project.startDate,
    targetLaunchDate: project.targetLaunchDate,
    launchDate: project.launchDate,
  });
}
