import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { getOrganizationByUserId } from '@/lib/db/organizations'
import { z } from 'zod'

// GET /api/distributor/inventory
// Returns all products assigned to this distributor, with their current self-reported stock levels.
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const org = await getOrganizationByUserId(userId)
  if (!org || !org.isDistributor) {
    return NextResponse.json({ error: 'Forbidden — not a distributor account.' }, { status: 403 })
  }

  // All products assigned to this distributor
  const products = await prisma.product.findMany({
    where: { distributorOrgId: org.id, available: true },
    select: {
      id: true,
      name: true,
      category: true,
      unit: true,
      distributorInventory: {
        where: { distributorOrgId: org.id },
        select: {
          id: true,
          quantityOnHand: true,
          quantityBackstock: true,
          notes: true,
          updatedAt: true,
        },
      },
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })

  const result = products.map(p => ({
    productId: p.id,
    name: p.name,
    category: p.category,
    unit: p.unit,
    report: p.distributorInventory[0] ?? null,
  }))

  return NextResponse.json({ products: result })
}

// POST /api/distributor/inventory
// Bulk upsert stock levels for products assigned to this distributor.
// Body: { updates: [{ productId, quantityOnHand, quantityBackstock, notes? }] }
const updateSchema = z.object({
  updates: z.array(z.object({
    productId: z.string().min(1),
    quantityOnHand: z.number().int().min(0),
    quantityBackstock: z.number().int().min(0),
    notes: z.string().max(500).optional(),
  })).min(1).max(100),
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const org = await getOrganizationByUserId(userId)
  if (!org || !org.isDistributor) {
    return NextResponse.json({ error: 'Forbidden — not a distributor account.' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  // Verify all productIds belong to this distributor
  const productIds = parsed.data.updates.map(u => u.productId)
  const ownedProducts = await prisma.product.findMany({
    where: { id: { in: productIds }, distributorOrgId: org.id },
    select: { id: true },
  })
  const ownedIds = new Set(ownedProducts.map(p => p.id))
  const unauthorized = productIds.filter(id => !ownedIds.has(id))
  if (unauthorized.length > 0) {
    return NextResponse.json({ error: 'Some products are not assigned to your account.' }, { status: 403 })
  }

  // Upsert each record
  await Promise.all(parsed.data.updates.map(u =>
    prisma.distributorInventory.upsert({
      where: { distributorOrgId_productId: { distributorOrgId: org.id, productId: u.productId } },
      create: {
        distributorOrgId: org.id,
        productId: u.productId,
        quantityOnHand: u.quantityOnHand,
        quantityBackstock: u.quantityBackstock,
        notes: u.notes ?? null,
      },
      update: {
        quantityOnHand: u.quantityOnHand,
        quantityBackstock: u.quantityBackstock,
        notes: u.notes ?? null,
      },
    })
  ))

  await prisma.auditEvent.create({
    data: {
      entityType: 'Organization',
      entityId: org.id,
      action: 'distributor_inventory_reported',
      userId,
      metadata: { productCount: parsed.data.updates.length },
    },
  })

  return NextResponse.json({ success: true, updated: parsed.data.updates.length })
}
