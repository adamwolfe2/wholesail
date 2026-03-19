import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";
import { notifyAdminCallBooked } from "@/lib/email/notifications";

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

  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

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

  try {
    const intake = await prisma.intakeSubmission.findUnique({
      where: { id },
      select: {
        id: true,
        companyName: true,
        contactName: true,
        contactEmail: true,
        calBooked: true,
      },
    });

    if (!intake) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.intakeSubmission.update({
      where: { id },
      data: { calBooked: true },
    });

    // Notify admin only on first booking (idempotent). Fire-and-forget — the
    // send helper already swallows internal errors via its own .catch().
    if (!intake.calBooked) {
      void notifyAdminCallBooked({
        companyName: intake.companyName,
        contactName: intake.contactName,
        contactEmail: intake.contactEmail,
        intakeId: intake.id,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/intake/[id]/cal-booked]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
