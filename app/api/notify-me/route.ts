import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { publicSignupLimiter, checkRateLimit, getIp } from "@/lib/rate-limit";

const schema = z.object({
  productSlug: z.string().min(1).max(200),
  email: z.string().email().optional(),
  name: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  // Rate limit: 5 alerts per IP per hour (shares publicSignupLimiter)
  const { allowed } = await checkRateLimit(publicSignupLimiter, getIp(req));
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { productSlug } = parsed.data;

    // For signed-in users, pull email from their account
    const { userId } = await auth();
    let email = parsed.data.email;
    let name = parsed.data.name;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });
      if (user) {
        email = user.email;
        name = user.name ?? name;
      }
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Upsert alert
    await prisma.productNotifyAlert.upsert({
      where: { productSlug_email: { productSlug, email } },
      create: { productSlug, email, name: name ?? null },
      update: { name: name ?? undefined },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/notify-me error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
