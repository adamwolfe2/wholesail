import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const count = await prisma.notification.count({
    where: { userId, read: false },
  });

  return NextResponse.json({ unreadCount: count });
}
