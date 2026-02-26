import { NextRequest, NextResponse } from "next/server";
import { getProjectByEmail } from "@/lib/db/projects";

export async function GET(req: NextRequest) {
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

  // Return sanitized data — no financials, no envVars, no internal details
  return NextResponse.json({
    id: project.id,
    company: project.company,
    shortName: project.shortName,
    status: project.status,
    currentPhase: project.currentPhase,
    enabledFeatures: project.enabledFeatures,
    domain: project.domain,
    customDomain: project.customDomain,
    vercelUrl: project.vercelUrl,
    startDate: project.startDate,
    targetLaunchDate: project.targetLaunchDate,
    launchDate: project.launchDate,
    notes: project.notes.map((n) => ({
      text: n.text,
      type: n.type,
      date: n.createdAt.toISOString().split("T")[0],
    })),
  });
}
