import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendLowStockAlert } from '@/lib/email'

// Vercel cron calls this as GET with Authorization header
// Recommended schedule: 0 8 * * * (8am UTC daily)
export async function GET(req: NextRequest) {
  // Verify cron secret — fail secure if not configured
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('CRON_SECRET env var is not set — aborting cron to prevent open access')
    return NextResponse.json({ error: 'Cron not configured' }, { status: 503 })
  }
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find all inventory levels where stock is at or below threshold for available products.
    // Prisma doesn't support field-to-field comparisons in where clauses, so we fetch all
    // tracked inventory for available products and filter in-process.
    const allLevels = await prisma.inventoryLevel.findMany({
      where: {
        product: {
          available: true,
        },
      },
      include: {
        product: {
          select: { name: true, category: true, available: true },
        },
      },
    })

    const lowStockLevels = allLevels.filter(
      (level) => level.quantityOnHand <= level.lowStockThreshold
    )

    if (lowStockLevels.length === 0) {
      console.info('Low stock cron: no items below threshold')
      return NextResponse.json({ ok: true, alerts: 0 })
    }

    const items = lowStockLevels.map((level) => ({
      name: level.product.name,
      category: level.product.category,
      quantityOnHand: level.quantityOnHand,
      lowStockThreshold: level.lowStockThreshold,
    }))

    await sendLowStockAlert(items)

    console.info(`Low stock cron: alert sent for ${items.length} item(s)`)

    return NextResponse.json({
      ok: true,
      alerts: items.length,
      products: items.map((i) => i.name),
    })
  } catch (err) {
    console.error('Low stock cron error:', err)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
