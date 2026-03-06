import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { pushContact, isConfigured } from "@/lib/integrations/emailbison";

export async function POST(req: NextRequest) {
  let body: { email?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const source = body.source ?? "blog";

  try {
    // Dedup check
    const existing = await prisma.emailSubscriber.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ ok: true, already: true });
    }

    // Push to Cursive campaign
    let cursiveContactId: string | null = null;
    if (isConfigured()) {
      try {
        const result = await pushContact({
          email,
          first_name: email.split("@")[0],
          description: `Wholesail blog subscriber (source: ${source})`,
        });
        cursiveContactId = result.id ?? null;
      } catch {
        // Don't fail the subscription if Cursive push fails
      }
    }

    await prisma.emailSubscriber.create({
      data: { email, source, cursiveContactId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/subscribe]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
