/**
 * Bootstrap: elevates the currently signed-in Clerk user to ADMIN.
 * Protected by BOOTSTRAP_SECRET env var — cannot be called without it.
 *
 * This endpoint is at /api/bootstrap (not /api/admin/bootstrap) so it is
 * reachable before any user record exists in the DB.
 *
 * Usage: POST { secret: process.env.BOOTSTRAP_SECRET } while signed in.
 * Idempotent: returns 409 if an admin already exists for a different user.
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

  // Idempotency guard: block if a different admin already exists
  const existingAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (existingAdmin && existingAdmin.id !== userId) {
    return NextResponse.json({ error: "Admin already bootstrapped" }, { status: 409 });
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
