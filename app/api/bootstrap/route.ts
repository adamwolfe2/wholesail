/**
 * One-time bootstrap: elevates the currently signed-in Clerk user to ADMIN.
 * Protected by BOOTSTRAP_SECRET so it can't be called by anyone else.
 *
 * Usage (run once after first deploy):
 *   curl -X POST https://wholesailhub.com/api/bootstrap \
 *     -H "Content-Type: application/json" \
 *     -d '{"secret":"<BOOTSTRAP_SECRET>"}'
 *
 * Or from the browser console while signed in:
 *   fetch('/api/bootstrap', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ secret: '<BOOTSTRAP_SECRET>' })
 *   }).then(r => r.json()).then(console.log)
 */
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }

  const { secret } = await req.json().catch(() => ({ secret: "" }));
  if (!secret || secret !== process.env.BOOTSTRAP_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    console.error("[POST /api/admin/bootstrap] Could not fetch Clerk user for userId:", userId);
    return NextResponse.json({ error: "Could not fetch user" }, { status: 500 });
  }

  // Idempotency: only allow bootstrap if no admin exists, or if caller is already admin
  const existingAdmins = await prisma.user.count({ where: { role: "ADMIN" } });
  if (existingAdmins > 0) {
    const callerIsAdmin = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (callerIsAdmin?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bootstrap already completed. Contact an existing admin." },
        { status: 409 }
      );
    }
  }

  const email =
    clerkUser.emailAddresses[0]?.emailAddress ?? `${userId}@unknown.com`;
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    email;

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: { role: "ADMIN" },
    create: { id: userId, email, name, role: "ADMIN" },
  });

  return NextResponse.json({
    ok: true,
    userId: user.id,
    email: user.email,
    role: user.role,
  });
}
