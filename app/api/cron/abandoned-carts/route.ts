import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendAbandonedCartEmail } from '@/lib/email'
import { getSiteUrl } from '@/lib/get-site-url'

// Vercel cron calls this as GET with Authorization header
// Schedule: 0 10,14,18 * * * (10am, 2pm, 6pm UTC daily)
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

  const APP_URL = getSiteUrl()
  const now = new Date()

  // Find carts that:
  // 1. Were last updated > 2 hours ago (abandoned window)
  // 2. Have items
  // 3. Haven't received an abandonment email in the last 48 hours (or never)
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)

  try {
    const abandonedCarts = await prisma.savedCart.findMany({
      where: {
        updatedAt: { lt: twoHoursAgo },
        items: { some: {} }, // cart has at least one item
        OR: [
          { lastAbandonmentEmailAt: null },
          { lastAbandonmentEmailAt: { lt: fortyEightHoursAgo } },
        ],
      },
      include: {
        items: {
          include: { product: { select: { name: true, price: true } } },
        },
        user: { select: { id: true, name: true, email: true } },
      },
      take: 50, // safety cap per run
    })

    let sent = 0
    let skipped = 0
    const errors: string[] = []

    // Batch-check for recent orders to avoid N+1
    const userIds = abandonedCarts.map((c) => c.userId)
    const recentOrders = await prisma.order.findMany({
      where: {
        userId: { in: userIds },
        createdAt: { gt: twoHoursAgo },
      },
      select: { userId: true, createdAt: true },
    })
    const recentOrderByUser = new Map<string, Date>()
    for (const o of recentOrders) {
      const existing = recentOrderByUser.get(o.userId)
      if (!existing || o.createdAt > existing) {
        recentOrderByUser.set(o.userId, o.createdAt)
      }
    }

    for (const cart of abandonedCarts) {
      // Skip if user has placed an order more recently than the cart was last updated
      const latestOrder = recentOrderByUser.get(cart.userId)
      const recentOrder = latestOrder && latestOrder > cart.updatedAt ? { id: true } : null

      if (recentOrder) {
        // User checked out after this cart was saved — clear the stale cart silently
        await prisma.savedCartItem.deleteMany({ where: { cartId: cart.id } })
        await prisma.savedCart.delete({ where: { id: cart.id } })
        skipped++
        continue
      }

      const emailItems = cart.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      }))

      const cartTotal = emailItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      )

      try {
        const result = await sendAbandonedCartEmail({
          email: cart.user.email,
          name: cart.user.name.split(' ')[0] || cart.user.name,
          items: emailItems,
          cartTotal,
          checkoutUrl: `${APP_URL}/checkout`,
        })

        if (result.success) {
          await prisma.savedCart.update({
            where: { id: cart.id },
            data: { lastAbandonmentEmailAt: now },
          })
          sent++
        } else {
          errors.push(`Cart ${cart.id}: email send failed`)
          skipped++
        }
      } catch (err) {
        errors.push(`Cart ${cart.id}: ${err instanceof Error ? err.message : 'unknown error'}`)
        skipped++
      }
    }

    console.info(`Abandoned cart cron: ${sent} sent, ${skipped} skipped, ${errors.length} errors`)

    return NextResponse.json({
      processed: abandonedCarts.length,
      sent,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    console.error('Abandoned cart cron error:', err)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
