import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendWeeklyDigestEmail, shouldSendEmail } from '@/lib/email'

// Vercel cron — runs every Monday at 8am UTC
// Schedule: 0 8 * * 1
export async function GET(req: NextRequest) {
  // Fail-secure CRON_SECRET auth (same pattern as billing-reminders)
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('CRON_SECRET env var is not set — aborting cron to prevent open access')
    return NextResponse.json({ error: 'Cron not configured' }, { status: 503 })
  }
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // Date windows
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  let sent = 0
  let skipped = 0
  const errors: string[] = []

  try {
    // Find all active wholesale orgs (ordered in the last 90 days)
    const activeOrgs = await prisma.organization.findMany({
      where: {
        isWholesaler: true,
        orders: {
          some: {
            createdAt: { gte: ninetyDaysAgo },
            status: { not: 'CANCELLED' },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        contactPerson: true,
        notificationPrefs: true,
      },
    })

    // Get new drops from the last week (available in the next week or dropped recently)
    const recentDrops = await prisma.productDrop.findMany({
      where: {
        isPublic: true,
        dropDate: {
          gte: sevenDaysAgo,
          lte: nextWeek,
        },
      },
      select: {
        title: true,
        description: true,
        dropDate: true,
      },
      orderBy: { dropDate: 'asc' },
      take: 5,
    })

    const newDrops = recentDrops.map((d) => ({
      title: d.title,
      description: d.description,
      dropDate: d.dropDate.toISOString(),
    }))

    for (const org of activeOrgs) {
      try {
        // Check notification preferences — skip if emailWeeklyDigest is false
        const prefs = org.notificationPrefs as
          | { emailDropAlerts?: boolean; emailOrderUpdates?: boolean; emailWeeklyDigest?: boolean }
          | null
        if (!shouldSendEmail(prefs, 'weekly')) {
          skipped++
          continue
        }

        const firstName = org.contactPerson?.split(' ')[0] || org.name

        // Month-to-date orders
        const monthOrders = await prisma.order.findMany({
          where: {
            organizationId: org.id,
            status: { not: 'CANCELLED' },
            createdAt: { gte: startOfMonth },
          },
          select: {
            total: true,
            createdAt: true,
            items: {
              select: { name: true, quantity: true },
            },
          },
        })

        const totalOrdersThisMonth = monthOrders.length
        const totalSpentThisMonth = monthOrders.reduce(
          (sum, o) => sum + Number(o.total),
          0
        )

        // Top products this month by quantity
        const productQtyMap = new Map<string, number>()
        for (const order of monthOrders) {
          for (const item of order.items) {
            productQtyMap.set(
              item.name,
              (productQtyMap.get(item.name) || 0) + item.quantity
            )
          }
        }
        const topProductsThisWeek = Array.from(productQtyMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, qty]) => ({ name, qty }))

        // Check if they haven't ordered in 7+ days — suggest reorder items
        const lastOrder = await prisma.order.findFirst({
          where: {
            organizationId: org.id,
            status: { not: 'CANCELLED' },
          },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        })

        const daysSinceLast = lastOrder
          ? Math.floor(
              (now.getTime() - lastOrder.createdAt.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 999

        let reorderSuggestions: string[] = []
        if (daysSinceLast >= 7) {
          // Get their top all-time products as reorder suggestions
          const topItems = await prisma.orderItem.groupBy({
            by: ['name'],
            where: {
              order: {
                organizationId: org.id,
                status: { not: 'CANCELLED' },
              },
            },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5,
          })
          reorderSuggestions = topItems.map((i) => i.name)
        }

        // Send the digest
        const result = await sendWeeklyDigestEmail({
          email: org.email,
          name: firstName,
          orgName: org.name,
          topProductsThisWeek,
          newDrops,
          totalOrdersThisMonth,
          totalSpentThisMonth,
          reorderSuggestions,
        })

        if (result && 'success' in result && result.success) {
          // Record in audit log to track sends
          await prisma.auditEvent.create({
            data: {
              action: 'weekly_digest_sent',
              entityType: 'Organization',
              entityId: org.id,
              metadata: {
                totalOrdersThisMonth,
                totalSpentThisMonth,
                reorderSuggestions,
                newDropsCount: newDrops.length,
              },
            },
          })
          sent++
        } else {
          errors.push(
            `Org ${org.id}: email failed — ${result && 'error' in result ? String(result.error) : 'unknown'}`
          )
          skipped++
        }
      } catch (err) {
        console.error(`Weekly digest error for org ${org.id}:`, err)
        errors.push(
          `org ${org.id}: ${err instanceof Error ? err.message : 'unknown'}`
        )
      }
    }

    console.info(
      `Weekly digest cron: checked=${activeOrgs.length}, sent=${sent}, skipped=${skipped}, errors=${errors.length}`
    )

    return NextResponse.json({
      checked: activeOrgs.length,
      sent,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    console.error('Weekly digest cron error:', err)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
