import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";
import { z } from "zod";

const VALID_EVENTS = [
  "order.created",
  "order.status_changed",
  "invoice.created",
  "payment.received",
] as const;

const updateSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.enum(VALID_EVENTS)).min(1).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/admin/webhooks/[id] — get endpoint details + recent logs
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  void req;
  const { id } = await params;

  const endpoint = await prisma.webhookEndpoint.findUnique({
    where: { id },
    include: {
      logs: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!endpoint) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  }

  // Mask the secret
  const masked = {
    ...endpoint,
    secret: endpoint.secret.slice(0, 8) + "..." + endpoint.secret.slice(-4),
  };

  return NextResponse.json({ endpoint: masked });
}

/**
 * PATCH /api/admin/webhooks/[id] — update endpoint
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const endpoint = await prisma.webhookEndpoint.update({
    where: { id },
    data: {
      ...(parsed.data.url && { url: parsed.data.url }),
      ...(parsed.data.events && { events: parsed.data.events }),
      ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
    },
  });

  return NextResponse.json({ endpoint });
}

/**
 * DELETE /api/admin/webhooks/[id] — delete endpoint and all logs
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  void req;
  const { id } = await params;

  await prisma.webhookEndpoint.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
