import { prisma } from "@/lib/db"
import { formatCurrency } from "@/lib/utils"
import { sendMessage } from "@/lib/integrations/blooio"
import { sendInternalOrderNotification } from "@/lib/email/index"
import { notifyDistributorsForOrder } from "@/lib/db/orders"
import { getSiteUrl } from "@/lib/get-site-url"
import { createOrderWithRetry } from "@/lib/order-number"

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
    const price = item.marketRate ? "market rate" : formatCurrency(item.unitPrice * item.quantity)
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

  // Fetch current product data including availability
  const smsProductIds = items.map((i) => i.productId)
  const smsProducts = await prisma.product.findMany({
    where: { id: { in: smsProductIds } },
    select: { id: true, available: true, distributorOrgId: true },
  })
  const smsProductMap = new Map(smsProducts.map((p) => [p.id, p]))

  // Filter out unavailable products
  const availableItems = items.filter((i) => {
    const product = smsProductMap.get(i.productId)
    return product && product.available !== false
  })
  if (availableItems.length === 0) {
    // Clean up draft since we can't fulfill it
    await prisma.smsOrderDraft.delete({ where: { id: draft.id } }).catch(() => {})
    throw new Error("All requested products are currently unavailable")
  }

  const smsDistributorMap = new Map(smsProducts.map((p) => [p.id, p.distributorOrgId ?? null]))

  const subtotal = availableItems.reduce(
    (sum, i) => sum + (i.marketRate ? 0 : i.unitPrice * i.quantity),
    0
  )

  const order = await createOrderWithRetry(async (orderNumber) => {
    return prisma.order.create({
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
          create: availableItems.map((i) => ({
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
  })
  const orderNumber = order.orderNumber

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
  const hasMarketRate = availableItems.some((i) => i.marketRate)
  const itemLines = availableItems.map(
    (i) =>
      `${i.quantity}× ${i.productName}${i.marketRate ? " (market rate)" : ` — ${formatCurrency(i.unitPrice * i.quantity)}`}`
  )

  // Email notification to ops
  await sendInternalOrderNotification({
    orderNumber,
    orderId: order.id,
    customerName: orgName,
    customerEmail: orgEmail,
    items: availableItems.map((i) => ({
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
