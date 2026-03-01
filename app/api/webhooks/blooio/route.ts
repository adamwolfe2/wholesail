import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, sendMessage } from "@/lib/integrations/blooio";
import { prisma } from "@/lib/db";

// ============================================================
// Bloo.io Webhook Handler
//
// Register this URL in your Bloo.io dashboard:
//   https://wholesailhub.com/api/webhooks/blooio
//
// Events handled:
//   message.received  — inbound iMessage from client
//   message.delivered — delivery confirmed
//   message.failed    — delivery failed
//   message.read      — read receipt (iMessage only)
//   message.sent      — outbound queued/sent
// ============================================================

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.BLOOIO_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("BLOOIO_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-blooio-signature") ?? "";
  const eventType = req.headers.get("x-blooio-event") ?? "";

  // Verify signature
  if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
    console.warn("Bloo.io webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    event_id?: string;
    data?: {
      id?: string;
      chat_id?: string;
      from?: string;
      to?: string[];
      text?: string;
      parts?: Array<{ type: string; value: string }>;
      status?: string;
      protocol?: string;
      failure_reason?: string;
      delivered_at?: string;
      read_at?: string;
      sent_at?: string;
    };
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = payload.data ?? {};

  try {
    switch (eventType) {
      case "message.received": {
        // Inbound iMessage from a client phone
        const fromPhone = data.from;
        const messageText = data.text ?? data.parts?.find(p => p.type === "text")?.value ?? "";

        // Find organization by matching phone number (last 10 digits, stripped)
        let org: { id: string; name: string; email: string } | null = null;
        if (fromPhone) {
          const digits = fromPhone.replace(/\D/g, "").slice(-10);
          const allOrgs = await prisma.organization.findMany({
            select: { id: true, name: true, email: true, phone: true },
          });
          const match = allOrgs.find(
            (o) => o.phone && o.phone.replace(/\D/g, "").slice(-10) === digits
          );
          org = match ? { id: match.id, name: match.name, email: match.email } : null;
        }

        await prisma.auditEvent.create({
          data: {
            entityType: "BlooioMessage",
            entityId: data.id ?? "unknown",
            action: "message_received",
            metadata: {
              eventId: payload.event_id,
              from: fromPhone,
              body: messageText.slice(0, 1000),
              blooioMessageId: data.id,
              organizationId: org?.id,
              organizationName: org?.name,
            },
          },
        });

        // --- HELP / MENU special commands ---
        if (fromPhone && messageText) {
          if (messageText.toUpperCase() === "HELP") {
            await sendMessage({
              to: fromPhone,
              message: "Wholesail SMS Ordering:\n• Text your order (e.g. '2 tins Kaluga caviar')\n• Reply YES to confirm, NO to cancel\n• Text MENU to see today's highlights\n• Order online: wholesailhub.com",
            });
            return NextResponse.json({ ok: true });
          }
          if (messageText.toUpperCase() === "STOP") {
            // Pause the next run of ALL active standing orders for this org
            if (org) {
              const nextWeek = new Date()
              nextWeek.setDate(nextWeek.getDate() + 7)
              await prisma.standingOrder.updateMany({
                where: { organizationId: org.id, isActive: true },
                data: { nextRunDate: nextWeek },
              })
              await sendMessage({
                to: fromPhone,
                message: `Got it — your standing orders are skipped for this week. They'll resume automatically next cycle. Text HELP for ordering options.`,
              })
            }
            return NextResponse.json({ ok: true })
          }
          if (messageText.toUpperCase() === "MENU") {
            const featured = await prisma.product.findMany({
              where: { available: true },
              take: 5,
              orderBy: { sortOrder: "asc" },
            });
            const menuText = featured
              .map(
                (p) =>
                  `• ${p.name} — ${p.marketRate ? "Market Rate" : "$" + Number(p.price).toFixed(2) + " " + p.unit}`
              )
              .join("\n");
            await sendMessage({
              to: fromPhone,
              message: `Today's highlights:\n\n${menuText}\n\nFull catalog: wholesailhub.com/catalog`,
            });
            return NextResponse.json({ ok: true });
          }
        }

        // If we matched an org, create a conversation + message in the portal DB
        // so staff can see and reply via the admin messages panel
        if (org && messageText) {
          const existing = await prisma.conversation.findFirst({
            where: { organizationId: org.id, isOpen: true },
            orderBy: { lastMessageAt: "desc" },
            select: { id: true, repClaimedAt: true },
          });

          const conversation = existing ?? (await prisma.conversation.create({
            data: {
              subject: `iMessage from ${fromPhone}`,
              organizationId: org.id,
            },
            select: { id: true, repClaimedAt: true },
          }));

          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              senderName: fromPhone ?? "Client",
              senderRole: "client",
              content: messageText,
            },
          });

          await prisma.conversation.update({
            where: { id: conversation.id },
            data: { lastMessageAt: new Date() },
          });

          // Check if rep has claimed this conversation (AI pauses for 24h when rep is active)
          const claimCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
          const isRepClaimed = conversation.repClaimedAt && conversation.repClaimedAt > claimCutoff

          if (isRepClaimed) {
            // Rep is handling this thread — skip AI processing entirely
            // The message is already saved to the conversation above; rep will respond manually
            break
          }

          // --- SMS Order Handling ---
          if (fromPhone) {
            const {
              isOrderIntent,
              isConfirmation,
              isCancellation,
              getPendingDraft,
              createDraft,
              clearDrafts,
              buildConfirmationMessage,
              convertDraftToOrder,
            } = await import("@/lib/sms-ordering");

            const pendingDraft = await getPendingDraft(fromPhone);

            if (pendingDraft && isConfirmation(messageText)) {
              // Convert draft to real order — Rocky gets notified and reviews before anything ships
              try {
                const orgUser = await prisma.user.findFirst({
                  where: { organizationId: org.id },
                });
                if (orgUser) {
                  const { orderNumber } = await convertDraftToOrder(
                    pendingDraft,
                    orgUser.id,
                    org.name,
                    org.email
                  );
                  await sendMessage({
                    to: fromPhone,
                    message: `Got it! Order ${orderNumber} is in — ${process.env.OPS_NAME ?? 'our team'} will review and confirm within the hour. You'll get a text when it's confirmed and again when it ships.`,
                  });
                }
              } catch (e) {
                console.error("SMS order confirmation error:", e);
                await sendMessage({
                  to: fromPhone,
                  message:
                    "Sorry, something went wrong placing your order. Please call us or log in to wholesailhub.com.",
                });
              }
            } else if (pendingDraft && isCancellation(messageText)) {
              await clearDrafts(fromPhone);
              await sendMessage({
                to: fromPhone,
                message: "Order cancelled. No problem! Let us know if you need anything else.",
              });
            } else if (isOrderIntent(messageText)) {
              // Parse the order
              try {
                const { parseOrderText } = await import("@/lib/ai/order-parser");
                const parseResult = await parseOrderText(messageText);

                if (parseResult.items.length === 0) {
                  await sendMessage({
                    to: fromPhone,
                    message:
                      "I couldn't match any products to your message. Try something like: '2 tins Kaluga 000 and 1 lb black truffle'. You can also order at wholesailhub.com",
                  });
                } else {
                  const draftItems = parseResult.items.map((item) => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    quantity: item.quantity,
                    unitPrice: Number(item.product.price),
                    unit: item.product.unit,
                    marketRate: item.product.marketRate ?? false,
                  }));

                  await createDraft(fromPhone, org.id, messageText, draftItems);

                  const confirmMsg = buildConfirmationMessage(draftItems, org.name);
                  await sendMessage({ to: fromPhone, message: confirmMsg });

                  if (parseResult.unmatched.length > 0) {
                    await sendMessage({
                      to: fromPhone,
                      message: `Note: I couldn't find these items: ${parseResult.unmatched.join(", ")}. Check the catalog at wholesailhub.com/catalog`,
                    });
                  }
                }
              } catch (e) {
                console.error("SMS order parse error:", e);
                // Fall through — message was already saved to conversation
              }
            }
          }
          // --- End SMS Order Handling ---
        }
        break;
      }

      case "message.delivered": {
        await prisma.auditEvent.create({
          data: {
            entityType: "BlooioMessage",
            entityId: data.id ?? "unknown",
            action: "message_delivered",
            metadata: {
              eventId: payload.event_id,
              blooioMessageId: data.id,
              deliveredAt: data.delivered_at,
              protocol: data.protocol,
            },
          },
        });
        break;
      }

      case "message.failed": {
        await prisma.auditEvent.create({
          data: {
            entityType: "BlooioMessage",
            entityId: data.id ?? "unknown",
            action: "message_failed",
            metadata: {
              eventId: payload.event_id,
              blooioMessageId: data.id,
              failureReason: data.failure_reason,
            },
          },
        });
        break;
      }

      case "message.read": {
        await prisma.auditEvent.create({
          data: {
            entityType: "BlooioMessage",
            entityId: data.id ?? "unknown",
            action: "message_read",
            metadata: {
              eventId: payload.event_id,
              blooioMessageId: data.id,
              readAt: data.read_at,
            },
          },
        });
        break;
      }

      default:
        console.warn(`Bloo.io unhandled event: ${eventType}`);
    }
  } catch (err) {
    console.error("Bloo.io webhook processing error:", err);
    // Still return 200 — don't let Bloo.io retry on our DB errors
  }

  return NextResponse.json({ received: true });
}
