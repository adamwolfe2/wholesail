import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'

// GET /api/admin/inventory/distributor-stock
// Returns all self-reported distributor inventory, grouped by distributor.
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const reports = await prisma.distributorInventory.findMany({
    include: {
      distributor: { select: { id: true, name: true, email: true } },
      product: { select: { id: true, name: true, category: true, unit: true } },
    },
    orderBy: [{ distributor: { name: 'asc' } }, { product: { name: 'asc' } }],
    take: 2000,
  })

  // Group by distributor
  const byDistributor: Record<string, {
    distributor: { id: string; name: string; email: string }
    items: typeof reports
  }> = {}

  for (const r of reports) {
    const key = r.distributorOrgId
    if (!byDistributor[key]) {
      byDistributor[key] = { distributor: r.distributor, items: [] }
    }
    byDistributor[key].items.push(r)
  }

  return NextResponse.json({ groups: Object.values(byDistributor) })
}
