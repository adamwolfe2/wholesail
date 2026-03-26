import { NextRequest, NextResponse } from 'next/server'
import { captureWithContext } from '@/lib/sentry'
import { prisma } from '@/lib/db'
import { sendLapsedClientEmail, shouldSendEmail } from '@/lib/email/index'
import { sendMessage, toE164 } from '@/lib/integrations/blooio'
import { getSiteUrl } from '@/lib/brand'

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
      select: { id: true, name: true, email: true, phone: true, contactPerson: true, notificationPrefs: true },
      take: 500,
    })

    const orgIds = orgs.map((o) => o.id)

    // ── Batch pre-flight queries — replaces N+1 per-org lookups ───────────
    // 1. Last order date per org
    const lastOrderGroups = await prisma.order.groupBy({
      by: ['organizationId'],
      where: { organizationId: { in: orgIds }, status: { not: 'CANCELLED' } },
      _max: { createdAt: true },
    })
    const lastOrderAtByOrg = new Map(lastOrderGroups.map((g) => [g.organizationId, g._max.createdAt]))

    // 2. Recently-notified orgs (batch dedup check)
    const recentAudits = await prisma.auditEvent.findMany({
      where: {
        action: 'lapsed_client_email_sent',
        entityType: 'Organization',
        entityId: { in: orgIds },
        createdAt: { gte: day30 },
      },
      select: { entityId: true },
    })
    const recentlyNotifiedIds = new Set(recentAudits.map((e) => e.entityId))

    // 3. Pre-filter qualifying orgs in memory
    const qualifyingOrgs = orgs.filter((org) => {
      const lastOrderAt = lastOrderAtByOrg.get(org.id) ?? null
      if (!lastOrderAt) return false
      const daysSince = Math.floor((now.getTime() - lastOrderAt.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSince < 45 || daysSince > 90) return false
      if (recentlyNotifiedIds.has(org.id)) return false
      return true
    })

    // 4. Batch-fetch top products for all qualifying orgs (replaces N*2 queries)
    const topProductIdsByOrg = new Map<string, string[]>()
    let allProductsMap = new Map<string, { id: string; name: string; category: string }>()

    if (qualifyingOrgs.length > 0) {
      const qualifyingOrgIds = qualifyingOrgs.map((o) => o.id)
      const allItems = await prisma.orderItem.findMany({
        where: {
          order: { organizationId: { in: qualifyingOrgIds }, status: { not: 'CANCELLED' } },
        },
        select: { productId: true, order: { select: { organizationId: true } } },
      })

      const orgProductCounts = new Map<string, Map<string, number>>()
      for (const item of allItems) {
        const orgId = item.order.organizationId
        if (!orgProductCounts.has(orgId)) orgProductCounts.set(orgId, new Map())
        const m = orgProductCounts.get(orgId)!
        if (item.productId) m.set(item.productId, (m.get(item.productId) ?? 0) + 1)
      }
      for (const [orgId, productCounts] of orgProductCounts) {
        topProductIdsByOrg.set(
          orgId,
          Array.from(productCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => id)
        )
      }

      const allProductIds = [...new Set([...topProductIdsByOrg.values()].flat())]
      if (allProductIds.length > 0) {
        const products = await prisma.product.findMany({
          where: { id: { in: allProductIds } },
          select: { id: true, name: true, category: true },
        })
        allProductsMap = new Map(products.map((p) => [p.id, p]))
      }
    }

    skipped += orgs.length - qualifyingOrgs.length

    for (const org of qualifyingOrgs) {
      try {
        // Check notification preferences — skip if opted out of order-related emails
        const prefs = org.notificationPrefs as
          | { emailDropAlerts?: boolean; emailOrderUpdates?: boolean; emailWeeklyDigest?: boolean }
          | null
        if (!shouldSendEmail(prefs, 'orders')) {
          skipped++
          console.info(`[lapsed-clients] Skipped org ${org.id} — opted out of order emails`)
          continue
        }

        const lastOrderAt = lastOrderAtByOrg.get(org.id)!
        const daysSince = Math.floor((now.getTime() - lastOrderAt.getTime()) / (1000 * 60 * 60 * 24))

        const productIds = topProductIdsByOrg.get(org.id) ?? []
        const topProducts = productIds
          .map(id => allProductsMap.get(id))
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

        // Send SMS if phone is on file (fire-and-forget, captured below)
        const phone = org.phone ? toE164(org.phone) : null
        const smsPromise = phone
          ? sendMessage({
              to: phone,
              message: `Hey ${firstName}! It's been ${daysSince} days since your last order — running low on anything? Text your order or visit ${getSiteUrl().replace(/^https?:\/\//, '')}/catalog`,
            }).catch(err => {
              errors.push(`SMS failed for org ${org.id}: ${err instanceof Error ? err.message : 'unknown'}`)
              return null
            })
          : Promise.resolve(null)

        await smsPromise

        // Write audit event only after both channels have settled
        await prisma.auditEvent.create({
          data: {
            action: 'lapsed_client_contacted',
            entityType: 'Organization',
            entityId: org.id,
            metadata: {
              daysSinceLastOrder: daysSince,
              topProducts: topProducts.map(p => p.name),
              smsAttempted: !!phone,
            },
          },
        })

        emailed++
      } catch (err) {
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
    captureWithContext(err, { route: 'cron/lapsed-clients' })
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
