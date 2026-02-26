import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { Users, UserPlus, Star, CheckCircle } from 'lucide-react'
import { LeadsClient } from './leads-client'

export default async function LeadsPipelinePage() {
  let leads: Awaited<ReturnType<typeof getLeads>> = []
  let stats = { total: 0, newCount: 0, qualified: 0, converted: 0 }

  try {
    ;[leads, stats] = await Promise.all([getLeads(), getStats()])
  } catch {
    // DB not connected
  }

  const serialized = leads.map((l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    restaurant: l.restaurant,
    website: l.website,
    source: l.source,
    status: l.status as 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST',
    notes: l.notes,
    emailBisonId: l.emailBisonId,
    pushedAt: l.pushedAt?.toISOString() ?? null,
    createdAt: l.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
          Leads Pipeline
        </h2>
        <p className="text-sm text-[#0A0A0A]/50 mt-1">
          Giveaway signups, inbound inquiries, and partner prospects.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
              Total Leads
            </CardTitle>
            <Users className="h-4 w-4 text-[#C8C0B4]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-[#0A0A0A]">{stats.total}</div>
            <p className="text-xs text-[#0A0A0A]/40 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
              New
            </CardTitle>
            <UserPlus className="h-4 w-4 text-[#C8C0B4]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-[#0A0A0A]">{stats.newCount}</div>
            <p className="text-xs text-[#0A0A0A]/40 mt-1">Awaiting contact</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
              Qualified
            </CardTitle>
            <Star className="h-4 w-4 text-[#C8C0B4]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-[#0A0A0A]">{stats.qualified}</div>
            <p className="text-xs text-[#0A0A0A]/40 mt-1">Ready to close</p>
          </CardContent>
        </Card>

        <Card className="card-hover border-[#E5E1DB] bg-[#F9F7F4]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
              Converted
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-[#C8C0B4]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif text-[#0A0A0A]">{stats.converted}</div>
            <p className="text-xs text-[#0A0A0A]/40 mt-1">Became partners</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Table */}
      <LeadsClient initialLeads={serialized} />
    </div>
  )
}

async function getLeads() {
  return prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

async function getStats() {
  const [total, newCount, qualified, converted] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.lead.count({ where: { status: 'QUALIFIED' } }),
    prisma.lead.count({ where: { status: 'CONVERTED' } }),
  ])
  return { total, newCount, qualified, converted }
}
