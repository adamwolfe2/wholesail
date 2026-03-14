import { NextRequest } from "next/server";
import { requireAdminOrRep } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Audit-event actions we surface as notifications */
const NOTIFICATION_ACTIONS = [
  "created_by_rep",
  "reorder_created",
  "quote_sent_to_client",
  "quote_accepted_by_client",
  "quote_declined_by_client",
  "created", // for Invoice entityType
] as const;

const NOTIFICATION_ENTITY_TYPES_FOR_MESSAGES = ["Message"];

function classifyEvent(event: {
  action: string;
  entityType: string;
  entityId: string;
  metadata: unknown;
}): { type: string; title: string; link: string } | null {
  const meta = (event.metadata ?? {}) as Record<string, string>;

  if (
    event.action === "created_by_rep" ||
    event.action === "reorder_created"
  ) {
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

  if (
    event.action === "created" &&
    event.entityType === "Invoice"
  ) {
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
 * GET /api/admin/notifications/stream
 * Server-Sent Events endpoint. Polls AuditEvent every 5 seconds using
 * a cursor (last-seen timestamp) and pushes new notification events.
 */
export async function GET(req: NextRequest) {
  const { error } = await requireAdminOrRep();
  if (error) return error;

  // Parse initial cursor from query string (ISO timestamp)
  const cursorParam = req.nextUrl.searchParams.get("since");
  let cursor = cursorParam ? new Date(cursorParam) : new Date();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Send an initial keepalive comment so the client knows the connection is open
      controller.enqueue(encoder.encode(": connected\n\n"));

      const poll = async () => {
        try {
          const events = await prisma.auditEvent.findMany({
            where: {
              createdAt: { gt: cursor },
              OR: [
                { action: { in: [...NOTIFICATION_ACTIONS] } },
                { entityType: { in: NOTIFICATION_ENTITY_TYPES_FOR_MESSAGES } },
              ],
            },
            orderBy: { createdAt: "asc" },
            take: 50,
          });

          for (const ev of events) {
            const notification = classifyEvent(ev);
            if (!notification) continue;

            const payload = {
              id: ev.id,
              ...notification,
              timestamp: ev.createdAt.toISOString(),
            };

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
            );

            // Advance cursor
            if (ev.createdAt > cursor) {
              cursor = ev.createdAt;
            }
          }
        } catch {
          // DB error — send a comment so the connection stays alive
          controller.enqueue(encoder.encode(": poll-error\n\n"));
        }
      };

      // Poll loop
      const interval = setInterval(poll, 5000);

      // Run first poll immediately
      await poll();

      // Clean up when the client disconnects
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
