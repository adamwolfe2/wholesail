/**
 * One-time bootstrap: creates an ADMIN user record in the database.
 * Protected by BOOTSTRAP_SECRET — does NOT require Clerk auth session.
 *
 * Pass the Clerk userId and email directly so this works even when
 * the auth redirect loop prevents session establishment.
 *
 * Usage from browser console (no sign-in needed):
 *   fetch('/api/bootstrap', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({
 *       secret: '<BOOTSTRAP_SECRET>',
 *       clerkUserId: '<clerk_user_id>',
 *       email: 'you@example.com',
 *       name: 'Your Name'
 *     })
 *   }).then(r => r.json()).then(console.log)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { secret, clerkUserId, email, name } = body;

  if (!secret || secret !== process.env.BOOTSTRAP_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
  }

  if (!clerkUserId || !email) {
    return NextResponse.json(
      { error: "clerkUserId and email are required" },
      { status: 400 }
    );
  }

  // Idempotency: only allow bootstrap if no admin exists, or if caller is already admin
  const existingAdmins = await prisma.user.count({ where: { role: "ADMIN" } });
  if (existingAdmins > 0) {
    const callerIsAdmin = await prisma.user.findUnique({
      where: { id: clerkUserId },
      select: { role: true },
    });
    if (callerIsAdmin?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bootstrap already completed. Contact an existing admin." },
        { status: 409 }
      );
    }
  }

  const user = await prisma.user.upsert({
    where: { id: clerkUserId },
    update: { role: "ADMIN" },
    create: { id: clerkUserId, email, name: name || email, role: "ADMIN" },
  });

  return NextResponse.json({
    ok: true,
    userId: user.id,
    email: user.email,
    role: user.role,
  });
}
