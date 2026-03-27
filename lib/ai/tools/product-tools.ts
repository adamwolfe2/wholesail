import type { Tool } from '@anthropic-ai/sdk/resources/messages'
import { prisma } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { cachedTool } from '@/lib/ai/tool-cache'

type ToolInput = Record<string, unknown>
type ToolContext = { userId: string }

// ---------------------------------------------------------------------------
// Product/inventory executor functions
// ---------------------------------------------------------------------------

export const productExecutors: Record<string, (input: ToolInput, ctx: ToolContext) => Promise<unknown>> = {
  get_products: async (input) => {
    const query = input.query ? String(input.query) : undefined
    const availableOnly = Boolean(input.availableOnly)
    const category = input.category ? String(input.category) : undefined

    const products = await prisma.product.findMany({
      where: {
        ...(availableOnly ? { available: true } : {}),
        ...(category ? { category: { contains: category, mode: 'insensitive' } } : {}),
        ...(query ? { OR: [{ name: { contains: query, mode: 'insensitive' } }, { category: { contains: query, mode: 'insensitive' } }] } : {}),
      },
      include: { inventoryLevel: { select: { quantityOnHand: true, quantityReserved: true, lowStockThreshold: true } } },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      take: 30,
    })

    return products.map(p => ({
      name: p.name, category: p.category,
      price: formatCurrency(p.price), unit: p.unit,
      available: p.available, marketRate: p.marketRate, coldChain: p.coldChainRequired,
      inventory: p.inventoryLevel
        ? { onHand: p.inventoryLevel.quantityOnHand, available: p.inventoryLevel.quantityOnHand - p.inventoryLevel.quantityReserved, lowStock: p.inventoryLevel.quantityOnHand < p.inventoryLevel.lowStockThreshold }
        : null,
      link: `/admin/products/${p.id}`,
    }))
  },

  get_low_stock_alerts: async () => {
    return cachedTool('tool:get_low_stock_alerts', 600, async () => {
      const low = await prisma.$queryRaw<Array<{
        id: string; quantityOnHand: number; quantityReserved: number; lowStockThreshold: number;
        name: string; category: string; productId: string;
      }>>`
        SELECT il.id, il."quantityOnHand", il."quantityReserved", il."lowStockThreshold",
               p.name, p.category, p.id AS "productId"
        FROM "InventoryLevel" il
        JOIN "Product" p ON p.id = il."productId"
        WHERE il."quantityOnHand" <= il."lowStockThreshold"
        ORDER BY il."quantityOnHand" ASC
      `

      return {
        count: low.length,
        items: low.map(l => ({
          product: l.name, category: l.category,
          onHand: l.quantityOnHand, reserved: l.quantityReserved, threshold: l.lowStockThreshold,
          link: `/admin/products/${l.productId}`,
        })),
      }
    })
  },

  update_product: async (input, ctx) => {
    const productId = String(input.productId)
    const fields: Record<string, unknown> = {}

    if (input.available !== undefined) fields.available = Boolean(input.available)
    if (input.price !== undefined) fields.price = Number(input.price)
    if (input.name !== undefined) fields.name = String(input.name)

    if (Object.keys(fields).length === 0) return { error: 'No fields provided. Supported: available (bool), price (number), name (string)' }

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { name: true } })
    if (!product) return { error: `Product not found: ${productId}` }

    await prisma.product.update({ where: { id: productId }, data: fields })
    await prisma.auditEvent.create({
      data: { entityType: 'Product', entityId: productId, action: 'product_updated_by_ai', userId: ctx.userId, metadata: fields as Record<string, unknown> },
    })

    return { success: true, productName: product.name, updated: fields, link: `/admin/products/${productId}` }
  },

  assign_distributor_to_product: async (input, ctx) => {
    const productId = String(input.productId)
    const distributorOrgId = input.distributorOrgId ? String(input.distributorOrgId) : null

    if (distributorOrgId) {
      const dist = await prisma.organization.findFirst({ where: { id: distributorOrgId, isDistributor: true }, select: { name: true } })
      if (!dist) return { error: `No distributor found with ID: ${distributorOrgId}. Use get_distributors to see available distributors.` }
    }

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { name: true } })
    if (!product) return { error: `Product not found: ${productId}` }

    await prisma.product.update({ where: { id: productId }, data: { distributorOrgId } })
    await prisma.auditEvent.create({
      data: { entityType: 'Product', entityId: productId, action: 'distributor_assigned', userId: ctx.userId, metadata: { distributorOrgId } },
    })

    return {
      success: true, productName: product.name,
      distributorOrgId,
      message: distributorOrgId ? 'Distributor assigned.' : 'Distributor removed.',
      link: `/admin/products/${productId}`,
    }
  },

  get_top_products: async (input) => {
    const limit = Number(input.limit ?? 10)
    const metric = String(input.metric ?? 'revenue')
    return cachedTool(`tool:get_top_products:${metric}`, 900, async () => {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const allTimeRaw = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: { order: { status: { not: 'CANCELLED' } } },
        _sum: { total: true, quantity: true },
        orderBy: metric === 'volume' ? { _sum: { quantity: 'desc' } } : { _sum: { total: 'desc' } },
        take: limit,
      })

      const thisMonthRaw = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: { order: { status: { not: 'CANCELLED' }, createdAt: { gte: startOfMonth } } },
        _sum: { total: true, quantity: true },
        orderBy: metric === 'volume' ? { _sum: { quantity: 'desc' } } : { _sum: { total: 'desc' } },
        take: limit,
      })

      const allIds = [...new Set([...allTimeRaw.map(p => p.productId), ...thisMonthRaw.map(p => p.productId)])].filter((id): id is string => id !== null)
      const products = await prisma.product.findMany({
        where: { id: { in: allIds } },
        select: { id: true, name: true, category: true },
      })
      const productMap = Object.fromEntries(products.map(p => [p.id, p]))

      return {
        metric,
        allTime: allTimeRaw.map((p, i) => ({
          rank: i + 1,
          name: (p.productId ? productMap[p.productId]?.name : undefined) ?? 'Unknown',
          category: (p.productId ? productMap[p.productId]?.category : undefined) ?? null,
          revenue: formatCurrency(p._sum.total ?? 0),
          unitsSold: p._sum.quantity ?? 0,
        })),
        thisMonth: thisMonthRaw.map((p, i) => ({
          rank: i + 1,
          name: (p.productId ? productMap[p.productId]?.name : undefined) ?? 'Unknown',
          category: (p.productId ? productMap[p.productId]?.category : undefined) ?? null,
          revenue: formatCurrency(p._sum.total ?? 0),
          unitsSold: p._sum.quantity ?? 0,
        })),
      }
    })
  },
}

// ---------------------------------------------------------------------------
// Product-related Anthropic tool definitions
// ---------------------------------------------------------------------------

export const productToolDefinitions: Tool[] = [
  {
    name: 'get_products',
    description: 'Search the product catalog with pricing, availability, and inventory status.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search by name or category' },
        availableOnly: { type: 'boolean' },
        category: { type: 'string' },
      },
    },
  },
  {
    name: 'get_low_stock_alerts',
    description: 'Get all products at or below their low-stock threshold.',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'update_product',
    description: 'Update a product\'s availability, price, or name. Use productId from get_products.',
    input_schema: {
      type: 'object' as const,
      properties: {
        productId: { type: 'string', description: 'The product ID (from get_products)' },
        available: { type: 'boolean', description: 'Toggle availability on/off' },
        price: { type: 'number', description: 'New price in dollars' },
        name: { type: 'string', description: 'New product name' },
      },
      required: ['productId'],
    },
  },
  {
    name: 'assign_distributor_to_product',
    description: 'Assign or remove a distributor from a product. This determines which distributor gets notified and fulfills that product\'s order items. Use get_distributors to get valid distributor IDs.',
    input_schema: {
      type: 'object' as const,
      properties: {
        productId: { type: 'string', description: 'The product ID (from get_products)' },
        distributorOrgId: { type: 'string', description: 'The distributor org ID, or null to remove the assignment' },
      },
      required: ['productId'],
    },
  },
  {
    name: 'get_top_products',
    description: 'Show bestselling products by revenue or volume. Use for "what\'s selling?", "best products", "top sellers", "what\'s not moving?", "slow movers".',
    input_schema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'number', description: 'Number of products to return (default 10)' },
        metric: { type: 'string', enum: ['revenue', 'volume'], description: 'Sort by revenue (dollars) or volume (units). Default: revenue' },
      },
    },
  },
]
