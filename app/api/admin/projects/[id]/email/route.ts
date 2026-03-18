import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { addNote } from "@/lib/db/projects";
import { z } from "zod";
import {
  sendPortalBuildingEmail,
  sendAssetRequestEmail,
  sendReadyForReviewEmail,
  sendPortalLiveEmail,
} from "@/lib/email/project-emails";

const schema = z.object({
  template: z.enum(["building", "assets", "review", "live"]),
});

const TEMPLATE_LABELS: Record<string, string> = {
  building: "Portal is being built",
  assets: "Asset request",
  review: "Ready for review",
  live: "Portal is live",
};

export async function POST(
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

  const project = await prisma.project.findUnique({
    where: { id, deletedAt: null },
    include: {
      intake: { select: { goLiveTimeline: true } },
    },
  });
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const emailData = {
    company: project.company,
    contactName: project.contactName,
    contactEmail: project.contactEmail,
    vercelUrl: project.vercelUrl,
    customDomain: project.customDomain,
    goLiveTimeline: project.intake?.goLiveTimeline ?? null,
  };

  let result: { success: boolean; error?: string };

  switch (data.template) {
    case "building":
      result = await sendPortalBuildingEmail(emailData);
      break;
    case "assets":
      result = await sendAssetRequestEmail(emailData);
      break;
    case "review":
      result = await sendReadyForReviewEmail(emailData);
      break;
    case "live":
      result = await sendPortalLiveEmail(emailData);
      break;
    default:
      return NextResponse.json({ error: "Unknown template" }, { status: 400 });
  }

  if (result.success) {
    // Log a note about the email
    await addNote(id, {
      text: `Email sent: "${TEMPLATE_LABELS[data.template]}" to ${project.contactEmail}`,
      type: "UPDATE",
    });
  }

  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
