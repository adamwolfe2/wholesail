import { NextRequest, NextResponse } from 'next/server'
import { captureWithContext } from '@/lib/sentry'
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
    // Use raw SQL for field-to-field comparison (quantityOnHand <= lowStockThreshold).
    // Prisma where clauses can't compare two columns directly — fetching all rows and
    // filtering in JS would load the full inventory table on every cron tick.
    type LowStockRow = {
      name: string
      category: string
      quantity_on_hand: number
      low_stock_threshold: number
    }

    const lowStockLevels = await prisma.$queryRaw<LowStockRow[]>`
      SELECT
        p.name,
        p.category,
        il."quantityOnHand"  AS quantity_on_hand,
        il."lowStockThreshold" AS low_stock_threshold
      FROM "InventoryLevel" il
      JOIN "Product" p ON p.id = il."productId"
      WHERE p.available = true
        AND il."quantityOnHand" <= il."lowStockThreshold"
    `

    if (lowStockLevels.length === 0) {
      console.info('Low stock cron: no items below threshold')
      return NextResponse.json({ ok: true, alerts: 0 })
    }

    const items = lowStockLevels.map((row) => ({
      name: row.name,
      category: row.category,
      quantityOnHand: Number(row.quantity_on_hand),
      lowStockThreshold: Number(row.low_stock_threshold),
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
    captureWithContext(err, { route: 'cron/low-stock-alerts' })
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
