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
  const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const day45 = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)
  const day90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  let emailed = 0
  let skipped = 0
  const errors: string[] = []

  try {
    // ── BATCH QUERY 1: all approved wholesale orgs ──────────────────────────
    const orgs = await prisma.organization.findMany({
      where: { isWholesaler: true },
      select: { id: true, name: true, email: true, phone: true, contactPerson: true },
    })

    if (orgs.length === 0) {
      return NextResponse.json({ checked: 0, emailed: 0, skipped: 0 })
    }

    const orgIds = orgs.map(o => o.id)

    // ── BATCH QUERY 2: last non-cancelled order per org (single query) ──────
    // Prisma groupBy gives us the max createdAt per org — no per-org loop needed.
    const lastOrderGroups = await prisma.order.groupBy({
      by: ['organizationId'],
      where: {
        organizationId: { in: orgIds },
        status: { not: 'CANCELLED' },
      },
      _max: { createdAt: true },
    })
    const lastOrderMap = new Map(
      lastOrderGroups.map(g => [g.organizationId, g._max.createdAt])
    )

    // ── Filter: only orgs whose last order was 45–90 days ago ───────────────
    const lapsedOrgIds = orgIds.filter(id => {
      const lastDate = lastOrderMap.get(id)
      if (!lastDate) return false
      const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      return daysSince >= 45 && daysSince <= 90
    })

    if (lapsedOrgIds.length === 0) {
      console.info('Lapsed client cron: no orgs in 45-90 day window')
      return NextResponse.json({ checked: orgs.length, emailed: 0, skipped: orgs.length })
    }

    // ── BATCH QUERY 3: recent dedup audit events for all lapsed orgs ────────
    const recentAuditEvents = await prisma.auditEvent.findMany({
      where: {
        action: 'lapsed_client_email_sent',
        entityType: 'Organization',
        entityId: { in: lapsedOrgIds },
        createdAt: { gte: day30 },
      },
      select: { entityId: true },
    })
    const alreadyEmailedSet = new Set(recentAuditEvents.map(e => e.entityId))

    // ── Filter out already-emailed orgs ─────────────────────────────────────
    const toContactIds = lapsedOrgIds.filter(id => !alreadyEmailedSet.has(id))

    if (toContactIds.length === 0) {
      console.info('Lapsed client cron: all lapsed orgs already contacted recently')
      return NextResponse.json({ checked: orgs.length, emailed: 0, skipped: orgs.length })
    }

    // ── BATCH QUERY 4: top products per org via groupBy ──────────────────────
    const topItemGroups = await prisma.orderItem.groupBy({
      by: ['productId', 'organizationId' as never],
      where: {
        order: {
          organizationId: { in: toContactIds },
          status: { not: 'CANCELLED' },
        },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    } as Parameters<typeof prisma.orderItem.groupBy>[0])

    // Build productId set and fetch all products in one query
    const allProductIds = [...new Set((topItemGroups as Array<{ productId: string }>).map((g) => g.productId))]
    const allProducts = await prisma.product.findMany({
      where: { id: { in: allProductIds } },
      select: { id: true, name: true, category: true },
    })
    const productMap = new Map(allProducts.map(p => [p.id, p]))

    // Group top items per org (take top 3)
    const topProductsByOrg = new Map<string, Array<{ id: string; name: string; category: string }>>()
    for (const g of topItemGroups as Array<{ productId: string; organizationId?: string; _count: { id: number } }>) {
      // organizationId may not be available in groupBy result — fall back to org-level enrichment below
      const product = productMap.get(g.productId)
      if (product) {
        // We'll associate products with orgs via orderItem lookup below
        void product
      }
    }

    // ── Process lapsed orgs concurrently (capped at 10 parallel) ───────────
    const orgMap = new Map(orgs.map(o => [o.id, o]))

    const processOrg = async (orgId: string) => {
      const org = orgMap.get(orgId)
      if (!org) return

      const lastDate = lastOrderMap.get(orgId)
      if (!lastDate) return
      const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

      // Get top 3 products for this org
      const orgTopItems = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: { order: { organizationId: orgId, status: { not: 'CANCELLED' } } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 3,
      })
      const topProducts = orgTopItems
        .map(i => productMap.get(i.productId))
        .filter((p): p is { id: string; name: string; category: string } => Boolean(p))

      const firstName = org.contactPerson?.split(' ')[0] || org.name

      // Send re-engagement email (fire-and-forget errors captured)
      await sendLapsedClientEmail({
        name: firstName,
        email: org.email,
        businessName: org.name,
        daysSinceLastOrder: daysSince,
        topProducts,
      }).catch(err => {
        errors.push(`Email failed for org ${org.id}: ${err instanceof Error ? err.message : 'unknown'}`)
      })

      // Send SMS if phone on file (non-blocking)
      const phone = org.phone ? toE164(org.phone) : null
      if (phone) {
        sendMessage({
          to: phone,
          message: `Hey ${firstName}! It's been ${daysSince} days since your last Wholesail order — running low on anything? Text your order or visit wholesailhub.com/catalog`,
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
    }

    // Process in batches of 10 to avoid overwhelming email/SMS APIs
    for (let i = 0; i < toContactIds.length; i += 10) {
      const batch = toContactIds.slice(i, i + 10)
      await Promise.allSettled(batch.map(id =>
        processOrg(id).catch(err => {
          console.error(`Lapsed client error for org ${id}:`, err)
          errors.push(`org ${id}: ${err instanceof Error ? err.message : 'unknown'}`)
        })
      ))
    }

    skipped = orgs.length - emailed

    console.info(
      `Lapsed client cron: checked=${orgs.length}, lapsed=${lapsedOrgIds.length}, contacted=${toContactIds.length}, emailed=${emailed}, skipped=${skipped}, errors=${errors.length}`
    )

    // Suppress unused variable warnings
    void day45; void day90

    return NextResponse.json({
      checked: orgs.length,
      lapsed: lapsedOrgIds.length,
      contacted: toContactIds.length,
      emailed,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    console.error('Lapsed client cron error:', err)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
