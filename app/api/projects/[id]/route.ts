import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth/require-admin";
import { z } from "zod";
import { getProjectById, updateProject, deleteProject } from "@/lib/db/projects";
import { notifyClientStatusChange, notifyClientPortalLive } from "@/lib/email/notifications";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(project);
}

const updateSchema = z.object({
  company: z.string().optional(),
  shortName: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().nullable().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().nullable().optional(),
  contactRole: z.string().nullable().optional(),
  domain: z.string().nullable().optional(),
  customDomain: z.string().nullable().optional(),
  githubRepo: z.string().nullable().optional(),
  vercelProject: z.string().nullable().optional(),
  vercelUrl: z.string().nullable().optional(),
  status: z.enum(["INQUIRY", "ONBOARDING", "BUILDING", "REVIEW", "LIVE", "CHURNED"]).optional(),
  currentPhase: z.number().min(0).max(15).optional(),
  enabledFeatures: z.array(z.string()).optional(),
  startDate: z.string().datetime().nullable().optional(),
  targetLaunchDate: z.string().datetime().nullable().optional(),
  launchDate: z.string().datetime().nullable().optional(),
  contractValue: z.number().optional(),
  retainer: z.number().optional(),
  monthlyRevenue: z.number().optional(),
  envVars: z.record(z.string(), z.string()).optional(),
  callNotes: z.string().nullable().optional(),
}).strict();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    // Get current project to detect status changes
    const current = await getProjectById(id);
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await updateProject(id, data);

    // Send email on meaningful status transitions
    if (data.status && data.status !== current.status) {
      const notifiableStatuses = ["ONBOARDING", "BUILDING", "REVIEW", "LIVE"];
      if (notifiableStatuses.includes(data.status)) {
        if (data.status === "LIVE" && updated.customDomain) {
          notifyClientPortalLive({
            contactName: updated.contactName,
            contactEmail: updated.contactEmail,
            companyName: updated.company,
            portalUrl: updated.customDomain,
          });
        } else {
          notifyClientStatusChange({
            contactName: updated.contactName,
            contactEmail: updated.contactEmail,
            companyName: updated.company,
            newStatus: data.status,
            currentPhase: updated.currentPhase,
          });
        }
      }
    }

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      );
    }
    console.error("[projects] Update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  await deleteProject(id);
  return NextResponse.json({ success: true });
}
