/**
 * Bootstrap: elevates the currently signed-in Clerk user to ADMIN.
 * Protected by BOOTSTRAP_SECRET — cannot be called without it.
 *
 * This endpoint is at /api/bootstrap (not /api/admin/bootstrap) so it is
 * reachable before any user record exists in the DB.
 *
 * Usage — run from browser console while signed in at wholesailhub.com:
 *   fetch('/api/bootstrap', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ secret: 'aeb2ff6ccb928d44a1d7b8f561688fb3' })
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
    return NextResponse.json({ error: "Could not fetch user" }, { status: 500 });
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
