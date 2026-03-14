import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrRep } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Audit-event actions we surface as notifications */
const NOTIFICATION_ACTIONS = [
  "created_by_rep",
  "reorder_created",
  "quote_sent_to_client",
  "quote_accepted_by_client",
  "quote_declined_by_client",
  "created",
];

const NOTIFICATION_ENTITY_TYPES_FOR_MESSAGES = ["Message"];

function classifyEvent(event: {
  action: string;
  entityType: string;
  entityId: string;
  metadata: unknown;
}): { type: string; title: string; link: string } | null {
  const meta = (event.metadata ?? {}) as Record<string, string>;

  if (event.action === "created_by_rep" || event.action === "reorder_created") {
    const orderNumber = meta.orderNumber ?? event.entityId;
    return {
      type: "new_order",
      title: `New Order #${orderNumber}`,
      link: `/admin/orders/${event.entityId}`,
    };
  }

  if (event.action === "quote_sent_to_client") {
    return {
      type: "quote_update",
      title: `Quote sent to client`,
      link: `/admin/quotes/${event.entityId}`,
    };
  }
  if (event.action === "quote_accepted_by_client") {
    return {
      type: "quote_update",
      title: `Quote accepted by client`,
      link: `/admin/quotes/${event.entityId}`,
    };
  }
  if (event.action === "quote_declined_by_client") {
    return {
      type: "quote_update",
      title: `Quote declined by client`,
      link: `/admin/quotes/${event.entityId}`,
    };
  }

  if (event.action === "created" && event.entityType === "Invoice") {
    return {
      type: "invoice_created",
      title: `Invoice created`,
      link: `/admin/invoices/${event.entityId}`,
    };
  }

  if (NOTIFICATION_ENTITY_TYPES_FOR_MESSAGES.includes(event.entityType)) {
    return {
      type: "new_message",
      title: `New message received`,
      link: `/admin/messages/${event.entityId}`,
    };
  }

  return null;
}

/**
 * GET /api/admin/notifications
 * Returns the last 50 notification-worthy audit events.
 * Pass ?seen=<ISO timestamp> to get an unread count based on that cursor.
 */
export async function GET(req: NextRequest) {
  const { error } = await requireAdminOrRep();
  if (error) return error;

  const seenParam = req.nextUrl.searchParams.get("seen");
  const seenAt = seenParam ? new Date(seenParam) : null;

  try {
    const events = await prisma.auditEvent.findMany({
      where: {
        OR: [
          { action: { in: NOTIFICATION_ACTIONS } },
          { entityType: { in: NOTIFICATION_ENTITY_TYPES_FOR_MESSAGES } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const notifications = events
      .map((ev) => {
        const classified = classifyEvent(ev);
        if (!classified) return null;
        return {
          id: ev.id,
          ...classified,
          timestamp: ev.createdAt.toISOString(),
          read: seenAt ? ev.createdAt <= seenAt : false,
        };
      })
      .filter(Boolean);

    const unreadCount = seenAt
      ? notifications.filter((n) => n && !n.read).length
      : notifications.length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    console.error("[notifications] GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/notifications
 * Mark notifications as seen. Body: { seenAt: ISO string }
 * Returns the seenAt timestamp for the client to store.
 */
export async function PATCH(req: NextRequest) {
  const { error } = await requireAdminOrRep();
  if (error) return error;

  try {
    const body = await req.json();
    const seenAt = body.seenAt ?? new Date().toISOString();

    return NextResponse.json({ seenAt });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
