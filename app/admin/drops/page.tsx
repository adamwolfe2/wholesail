import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { Calendar, Eye, Bell } from 'lucide-react'
import { DropsAdminClient } from './drops-admin-client'
import Link from 'next/link'

export const metadata: Metadata = { title: "Drops" };

export default async function AdminDropsPage() {
  let drops: Awaited<ReturnType<typeof getDrops>> = []
  let stats = { total: 0, publicCount: 0, totalSignups: 0 }

  try {
    ;[drops, stats] = await Promise.all([getDrops(), getStats()])
  } catch {
    // DB not connected
  }

  const serialized = drops.map((d) => ({
    id: d.id,
    title: d.title,
    category: d.category,
    dropDate: d.dropDate.toISOString(),
    description: d.description,
    isPublic: d.isPublic,
    alertCount: d._count.alerts,
    quantityTotal: d.quantityTotal,
    quantitySold: d.quantitySold,
    priceNote: d.priceNote,
    notifiedAt: d.notifiedAt ? d.notifiedAt.toISOString() : null,
    featured: d.featured,
    productName: d.product?.name ?? null,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
            Product Drops
          </h2>
          <p className="text-sm text-ink/50 mt-1">
            Manage upcoming seasonal drops and availability announcements.
          </p>
        </div>
        <Link
          href="/drops"
          target="_blank"
          className="text-xs text-ink/50 hover:text-ink transition-colors border border-shell px-3 py-1.5 hover:border-ink/40"
        >
          View public page ↗
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-shell bg-cream">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
              Total Drops
            </CardTitle>
            <Calendar className="h-4 w-4 text-sand" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-ink">{stats.total}</div>
            <p className="text-xs text-ink/40 mt-1">All scheduled</p>
          </CardContent>
        </Card>

        <Card className="border-shell bg-cream">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
              Public
            </CardTitle>
            <Eye className="h-4 w-4 text-sand" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-ink">{stats.publicCount}</div>
            <p className="text-xs text-ink/40 mt-1">Visible on drops page</p>
          </CardContent>
        </Card>

        <Card className="border-shell bg-cream">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
              Alert Signups
            </CardTitle>
            <Bell className="h-4 w-4 text-sand" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-ink">{stats.totalSignups}</div>
            <p className="text-xs text-ink/40 mt-1">Across all drops</p>
          </CardContent>
        </Card>
      </div>

      {/* Drops Table */}
      <DropsAdminClient initialDrops={serialized} />
    </div>
  )
}

async function getDrops() {
  return prisma.productDrop.findMany({
    orderBy: { dropDate: 'asc' },
    include: {
      _count: { select: { alerts: true } },
      product: { select: { name: true } },
    },
  })
}

async function getStats() {
  const [total, publicCount, alertAgg] = await Promise.all([
    prisma.productDrop.count(),
    prisma.productDrop.count({ where: { isPublic: true } }),
    prisma.dropAlert.count(),
  ])
  return { total, publicCount, totalSignups: alertAgg }
}
