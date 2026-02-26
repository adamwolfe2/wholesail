import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  contactPerson: z.string().min(1).max(100).optional(),
  phone: z.string().min(1).max(30).optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      organization: {
        select: { name: true, contactPerson: true, phone: true, email: true },
      },
    },
  });

  if (!user?.organization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  return NextResponse.json({ profile: user.organization });
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });

  if (!user?.organizationId) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const updated = await prisma.organization.update({
    where: { id: user.organizationId },
    data: parsed.data,
    select: { name: true, contactPerson: true, phone: true, email: true },
  });

  await prisma.auditEvent.create({
    data: {
      entityType: "Organization",
      entityId: user.organizationId,
      action: "profile_updated_by_client",
      userId,
      metadata: { fields: Object.keys(parsed.data) },
    },
  });

  return NextResponse.json({ profile: updated });
}
