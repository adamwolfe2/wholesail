import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getIntakeSubmissionById } from "@/lib/db/intake";
import { scrapeIntakeWebsite } from "@/lib/build/firecrawl";
import { prisma } from "@/lib/db";
import { aiCallLimiter, checkRateLimit } from "@/lib/rate-limit";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdmin();
  if (error) return error;

  const { allowed } = await checkRateLimit(aiCallLimiter, userId);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const { id } = await params;

  const intake = await getIntakeSubmissionById(id);
  if (!intake) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!intake.website) {
    return NextResponse.json(
      { error: "No website URL on intake — cannot scrape" },
      { status: 400 }
    );
  }

  await scrapeIntakeWebsite(id, intake.website, intake.inspirationUrls ?? []);

  const updated = await prisma.intakeSubmission.findUnique({
    where: { id },
    select: { scrapeData: true },
  });

  return NextResponse.json({ scrapeData: updated?.scrapeData ?? null });
}
