import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";

/**
 * POST /api/intake/[id]/cal-booked
 * Called by Cal.com webhook on booking confirmation.
 * Requires HMAC-SHA256 signature via X-Cal-Signature-256 header.
 * Marks the intake submission as having a booked call.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Validate id format to prevent path traversal probing
  if (!/^c[a-z0-9]{24,}$/.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Verify Cal.com webhook signature
  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (secret) {
    const rawBody = await req.text();
    const sig = req.headers.get("X-Cal-Signature-256") ?? "";
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    let valid = false;
    try {
      valid = timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    } catch {
      valid = false;
    }
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

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
