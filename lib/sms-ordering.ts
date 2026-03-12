import { prisma } from "@/lib/db"
import { sendMessage } from "@/lib/integrations/blooio"
import { sendInternalOrderNotification } from "@/lib/email/index"
import { notifyDistributorsForOrder } from "@/lib/db/orders"
import { getSiteUrl } from "@/lib/get-site-url"

// Simple intent detection — does this message look like an order?
export function isOrderIntent(text: string): boolean {
  const lower = text.toLowerCase().trim()
  // Confirmation replies
  if (/^(yes|yeah|yep|confirm|ok|okay|sure|go ahead|do it|y)\.?$/i.test(lower)) return false
  if (/^(no|nope|cancel|stop|nevermind|never mind|n)\.?$/i.test(lower)) return false
  // Order-like patterns: quantities + food words
  const hasQuantity = /\d+\s*(oz|lb|lbs|tin|tins|jar|jars|g|kg|piece|pieces|each|cs|case|pack)?/i.test(lower)
  const hasFoodWord = /(truffle|caviar|wagyu|foie|salumi|salmon|tuna|duck|lobster|uni|urchin|order|need|want|send|get me|lb|oz)/i.test(lower)
  return hasQuantity || hasFoodWord
}

export function isConfirmation(text: string): boolean {
  return /^(yes|yeah|yep|confirm|ok|okay|sure|go ahead|do it|y)\.?$/i.test(text.toLowerCase().trim())
}

export function isCancellation(text: string): boolean {
  return /^(no|nope|cancel|stop|nevermind|never mind|n)\.?$/i.test(text.toLowerCase().trim())
}

export interface DraftItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  unit: string
  marketRate: boolean
}

export async function getPendingDraft(phone: string) {
  return prisma.smsOrderDraft.findFirst({
    where: {
      phone,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function clearDrafts(phone: string) {
  await prisma.smsOrderDraft.deleteMany({ where: { phone } })
}

export async function createDraft(
  phone: string,
  orgId: string,
  rawText: string,
  items: DraftItem[]
) {
  await clearDrafts(phone)
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
  return prisma.smsOrderDraft.create({
    data: {
      organizationId: orgId,
      phone,
      rawText,
      items: items as unknown as import("@prisma/client").Prisma.JsonArray,
      expiresAt,
    },
  })
}

export function buildConfirmationMessage(items: DraftItem[], orgName: string): string {
  const lines = items.map((item) => {
    const price = item.marketRate ? "market rate" : `$${(item.unitPrice * item.quantity).toFixed(2)}`
    return `• ${item.quantity}× ${item.productName} — ${price}`
  })
  return [
    `Hey! Here's what I have for ${orgName}:`,
    "",
    ...lines,
    "",
    "Reply YES to confirm or NO to cancel. (Expires in 30 min)",
  ].join("\n")
}

export async function convertDraftToOrder(
  draft: { id: string; organizationId: string; items: unknown },
  userId: string,
  orgName: string,
  orgEmail: string
): Promise<{ orderNumber: string; orderId: string }> {
  const items = draft.items as DraftItem[]

  const subtotal = items.reduce(
    (sum, i) => sum + (i.marketRate ? 0 : i.unitPrice * i.quantity),
    0
  )

  // Fetch distributor assignment for each product
  const smsProductIds = items.map((i) => i.productId)
  const smsProducts = await prisma.product.findMany({
    where: { id: { in: smsProductIds } },
    select: { id: true, distributorOrgId: true },
  })
  const smsDistributorMap = new Map(smsProducts.map((p) => [p.id, p.distributorOrgId ?? null]))

  // Generate order number with retry loop for unique constraint violations
  let order: Awaited<ReturnType<typeof prisma.order.create>> | null = null
  let orderNumber = ""
  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await prisma.order.count()
    const year = new Date().getFullYear()
    orderNumber = `ORD-${year}-${String(count + 1 + attempt).padStart(4, "0")}`
    try {
      order = await prisma.order.create({
        data: {
          orderNumber,
          organizationId: draft.organizationId,
          userId,
          status: "PENDING",
          subtotal,
          tax: 0,
          deliveryFee: 0,
          total: subtotal,
          notes: "Placed via iMessage/SMS — awaiting rep review",
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              name: i.productName,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              total: i.marketRate ? 0 : i.unitPrice * i.quantity,
              distributorOrgId: smsDistributorMap.get(i.productId) ?? null,
            })),
          },
        },
      })
      break
    } catch (err) {
      if ((err as { code?: string }).code === "P2002" && attempt < 4) continue
      throw err
    }
  }

  if (!order) throw new Error("Failed to create order after 5 attempts")

  notifyDistributorsForOrder({
    orderId: order.id,
    orderNumber,
    clientName: orgName,
    clientEmail: orgEmail,
    deliveryAddress: null,
  }).catch(() => {})

  await prisma.smsOrderDraft.delete({ where: { id: draft.id } })

  await prisma.auditEvent.create({
    data: {
      action: "order_created_via_sms",
      entityType: "Order",
      entityId: order.id,
      userId,
      metadata: { orderNumber, source: "sms" },
    },
  })

  // ── Notify ops team — email + SMS ──────────────────────────
  const hasMarketRate = items.some((i) => i.marketRate)
  const itemLines = items.map(
    (i) =>
      `${i.quantity}× ${i.productName}${i.marketRate ? " (market rate)" : ` — $${(i.unitPrice * i.quantity).toFixed(2)}`}`
  )

  // Email notification to ops
  await sendInternalOrderNotification({
    orderNumber,
    orderId: order.id,
    customerName: orgName,
    customerEmail: orgEmail,
    items: items.map((i) => ({
      name: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      total: i.marketRate ? 0 : i.unitPrice * i.quantity,
    })),
    subtotal,
    total: subtotal,
  }).catch(console.error)

  // SMS notification to ops team (OPS_PHONE_NUMBER env var)
  const opsPhone = process.env.OPS_PHONE_NUMBER
  if (opsPhone) {
    const smsLines = itemLines.map((l) => `  ${l}`).join("\n")
    const reviewUrl = `${getSiteUrl()}/admin/orders/${order.id}`
    await sendMessage({
      to: opsPhone,
      message: [
        `📦 SMS Order — ${orgName}`,
        "",
        smsLines,
        "",
        hasMarketRate ? "⚠️ Has market-rate items — confirm pricing before confirming." : "",
        `Review: ${reviewUrl}`,
      ]
        .filter(Boolean)
        .join("\n"),
    }).catch(console.error)
  }

  return { orderNumber, orderId: order.id }
}
