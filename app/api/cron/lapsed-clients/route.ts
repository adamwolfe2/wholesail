import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendLapsedClientEmail } from '@/lib/email/index'
import { sendMessage, toE164 } from '@/lib/integrations/blooio'

// Vercel cron calls this as GET with Authorization header
// Schedule: 0 11 * * * (11am UTC daily)
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

  const now = new Date()
  const day45 = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)
  const day90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Suppress unused variable warnings — day45/day90 used in daysSince comparisons below
  void day45
  void day90

  let emailed = 0
  let skipped = 0
  const errors: string[] = []

  try {
    // Find all approved wholesale orgs
    const orgs = await prisma.organization.findMany({
      where: { isWholesaler: true },
      select: { id: true, name: true, email: true, phone: true, contactPerson: true },
    })

    for (const org of orgs) {
      try {
        // Find their most recent non-cancelled order
        const lastOrder = await prisma.order.findFirst({
          where: { organizationId: org.id, status: { not: 'CANCELLED' } },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        })

        if (!lastOrder) { skipped++; continue }

        const daysSince = Math.floor(
          (now.getTime() - lastOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        )

        // Only contact orgs whose last order was between 45 and 90 days ago
        if (daysSince < 45 || daysSince > 90) { skipped++; continue }

        // Dedup — skip if we already sent a lapsed-client email in the last 30 days
        const recentAudit = await prisma.auditEvent.findFirst({
          where: {
            action: 'lapsed_client_email_sent',
            entityType: 'Organization',
            entityId: org.id,
            createdAt: { gte: day30 },
          },
          select: { id: true },
        })
        if (recentAudit) { skipped++; continue }

        // Get top 3 most-ordered products for this org
        const topItems = await prisma.orderItem.groupBy({
          by: ['productId'],
          where: { order: { organizationId: org.id, status: { not: 'CANCELLED' } } },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 3,
        })
        const productIds = topItems.map(i => i.productId)
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, category: true },
        })
        // Preserve the order-by-frequency ordering
        const topProducts = productIds
          .map(id => products.find(p => p.id === id))
          .filter((p): p is { id: string; name: string; category: string } => Boolean(p))

        const firstName = org.contactPerson?.split(' ')[0] || org.name

        // Send re-engagement email
        await sendLapsedClientEmail({
          name: firstName,
          email: org.email,
          businessName: org.name,
          daysSinceLastOrder: daysSince,
          topProducts,
        }).catch(err => {
          errors.push(`Email failed for org ${org.id}: ${err instanceof Error ? err.message : 'unknown'}`)
        })

        // Send SMS if phone is on file
        const phone = org.phone ? toE164(org.phone) : null
        if (phone) {
          sendMessage({
            to: phone,
            message: `Hey ${firstName}! It's been ${daysSince} days since your last TBGC order — running low on anything? Text your order or visit truffleboys.com/catalog`,
          }).catch(err => {
            errors.push(`SMS failed for org ${org.id}: ${err instanceof Error ? err.message : 'unknown'}`)
          })
        }

        // Write audit event to prevent duplicate sends
        await prisma.auditEvent.create({
          data: {
            action: 'lapsed_client_email_sent',
            entityType: 'Organization',
            entityId: org.id,
            metadata: {
              daysSinceLastOrder: daysSince,
              topProducts: topProducts.map(p => p.name),
            },
          },
        })

        emailed++
      } catch (err) {
        console.error(`Lapsed client error for org ${org.id}:`, err)
        errors.push(`org ${org.id}: ${err instanceof Error ? err.message : 'unknown'}`)
      }
    }

    console.info(
      `Lapsed client cron: checked=${orgs.length}, emailed=${emailed}, skipped=${skipped}, errors=${errors.length}`
    )

    return NextResponse.json({
      checked: orgs.length,
      emailed,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    console.error('Lapsed client cron error:', err)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
