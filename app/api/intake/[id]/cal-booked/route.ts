import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/intake/[id]/cal-booked
 * Called by Cal.com webhook on booking confirmation.
 * Marks the intake submission as having a booked call.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const intake = await prisma.intakeSubmission.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!intake) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.intakeSubmission.update({
      where: { id },
      data: { calBooked: true },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/intake/[id]/cal-booked]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
