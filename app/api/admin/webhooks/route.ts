import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";

const VALID_EVENTS = [
  "order.created",
  "order.status_changed",
  "invoice.created",
  "payment.received",
] as const;

const createSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum(VALID_EVENTS)).min(1),
  orgId: z.string().optional(),
});

/**
 * GET /api/admin/webhooks — list all webhook endpoints
 */
export async function GET() {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const endpoints = await prisma.webhookEndpoint.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { logs: true } },
    },
  });

  return NextResponse.json({ endpoints });
}

/**
 * POST /api/admin/webhooks — create a new webhook endpoint
 */
export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const secret = crypto.randomBytes(32).toString("hex");

  const endpoint = await prisma.webhookEndpoint.create({
    data: {
      url: parsed.data.url,
      events: parsed.data.events,
      orgId: parsed.data.orgId ?? null,
      secret,
      isActive: true,
    },
  });

  // Return secret only on creation — it won't be shown again
  return NextResponse.json({ endpoint, secret }, { status: 201 });
}
