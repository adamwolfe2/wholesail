import type { Metadata } from "next";
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { WholesaleStatus } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/empty-state'
import { FileCheck, UserPlus } from 'lucide-react'

export const metadata: Metadata = { title: "Wholesale Applications" };

type StatusFilter = 'ALL' | WholesaleStatus
type SourceFilter = 'applications' | 'partners'

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Waitlisted', value: 'WAITLISTED' },
]

function statusBadge(status: WholesaleStatus) {
  const map: Record<WholesaleStatus, { label: string; className: string }> = {
    PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    APPROVED: { label: 'Approved', className: 'bg-green-100 text-green-800 border-green-300' },
    REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-300' },
    WAITLISTED: { label: 'Waitlisted', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  }
  const { label, className } = map[status]
  return (
    <Badge className={`text-xs font-medium border ${className}`}>
      {label}
    </Badge>
  )
}

function formatBusinessType(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export default async function AdminWholesalePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; source?: string }>
}) {
  const { status: statusParam, source: sourceParam } = await searchParams
  const activeSource: SourceFilter =
    sourceParam === 'partners' ? 'partners' : 'applications'

  const activeFilter: StatusFilter =
    statusParam && STATUS_TABS.some(t => t.value === statusParam.toUpperCase())
      ? (statusParam.toUpperCase() as StatusFilter)
      : 'ALL'

  let applications: Awaited<ReturnType<typeof getApplications>> = []
  let partnerOrgs: Awaited<ReturnType<typeof getPartnerOrgs>> = []

  try {
    if (activeSource === 'applications') {
      applications = await getApplications(activeFilter)
    } else {
      partnerOrgs = await getPartnerOrgs()
    }
  } catch {
    // DB not connected
  }

  const count = activeSource === 'applications' ? applications.length : partnerOrgs.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-normal text-[#0A0A0A]">Wholesale Applications</h2>
          <p className="text-sm text-[#0A0A0A]/50 mt-1">Review and manage partner applications</p>
        </div>
        <span className="text-sm text-[#0A0A0A]/50">{count} {activeSource === 'applications' ? 'applications' : 'sign-ups'}</span>
      </div>

      {/* Source tabs */}
      <div className="overflow-x-auto">
      <div className="flex gap-1 border-b border-[#E5E1DB] min-w-max">
        <Link
          href="/admin/wholesale"
          className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap -mb-px border-b-2 ${
            activeSource === 'applications'
              ? 'border-[#0A0A0A] text-[#0A0A0A]'
              : 'border-transparent text-[#0A0A0A]/50 hover:text-[#0A0A0A]'
          }`}
        >
          Wholesale Applications
        </Link>
        <Link
          href="/admin/wholesale?source=partners"
          className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap -mb-px border-b-2 ${
            activeSource === 'partners'
              ? 'border-[#0A0A0A] text-[#0A0A0A]'
              : 'border-transparent text-[#0A0A0A]/50 hover:text-[#0A0A0A]'
          }`}
        >
          Partner Sign-ups
        </Link>
      </div>
      </div>

      {activeSource === 'applications' ? (
        <>
          {/* Status sub-tabs */}
          <div className="overflow-x-auto">
          <div className="flex gap-1 border-b border-[#E5E1DB] min-w-max">
            {STATUS_TABS.map(tab => (
              <Link
                key={tab.value}
                href={tab.value === 'ALL' ? '/admin/wholesale' : `/admin/wholesale?status=${tab.value}`}
                className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap -mb-px border-b-2 ${
                  activeFilter === tab.value
                    ? 'border-[#0A0A0A] text-[#0A0A0A]'
                    : 'border-transparent text-[#0A0A0A]/50 hover:text-[#0A0A0A]'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
          </div>

          {applications.length === 0 ? (
            <EmptyState
              icon={FileCheck}
              title="No Applications"
              description="Applications submitted via the partner form will appear here once reviewed."
            />
          ) : (
            <div className="border border-[#E5E1DB] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E1DB] bg-[#F9F7F4]">
                      <th className="px-4 py-3 text-left font-medium text-[#0A0A0A]/60">Business</th>
                      <th className="px-4 py-3 text-left font-medium text-[#0A0A0A]/60 hidden sm:table-cell">Contact</th>
                      <th className="px-4 py-3 text-left font-medium text-[#0A0A0A]/60 hidden md:table-cell">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-[#0A0A0A]/60 hidden md:table-cell">Phone</th>
                      <th className="px-4 py-3 text-left font-medium text-[#0A0A0A]/60 hidden sm:table-cell">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-[#0A0A0A]/60 hidden md:table-cell">Volume</th>
                      <th className="px-4 py-3 text-left font-medium text-[#0A0A0A]/60 hidden sm:table-cell">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-[#0A0A0A]/60">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-[#0A0A0A]/60"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E1DB]">
                    {applications.map(app => (
                      <tr key={app.id} className="bg-white hover:bg-[#F9F7F4] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#0A0A0A]">{app.businessName}</td>
                        <td className="px-4 py-3 text-[#0A0A0A]/70 hidden sm:table-cell">{app.contactName}</td>
                        <td className="px-4 py-3 text-[#0A0A0A]/70 hidden md:table-cell">{app.email}</td>
                        <td className="px-4 py-3 text-[#0A0A0A]/70 hidden md:table-cell">{app.phone}</td>
                        <td className="px-4 py-3 text-[#0A0A0A]/70 hidden sm:table-cell">{formatBusinessType(app.businessType)}</td>
                        <td className="px-4 py-3 text-[#0A0A0A]/70 hidden md:table-cell">{app.monthlyVolume ?? '—'}</td>
                        <td className="px-4 py-3 text-[#0A0A0A]/60 whitespace-nowrap hidden sm:table-cell">
                          {app.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">{statusBadge(app.status)}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/wholesale/${app.id}`}
                            className="text-[#0A0A0A] underline underline-offset-4 text-sm hover:opacity-70 transition-opacity whitespace-nowrap"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="text-xs text-[#0A0A0A]/50">
            These are businesses that submitted the partner sign-up form. They are stored as Organizations (tier: NEW) and have not yet been assigned an account manager.
          </p>
          {partnerOrgs.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="No Partner Sign-ups"
              description="Businesses that complete the partner application form will appear here."
              action={{ label: 'View Partner Form', href: '/partner' }}
            />
          ) : (
            <div className="border border-[#E5E1DB] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E1DB] bg-[#F9F7F4]">
                      <th className="px-4 py-3 text-left font-medium text-[#0A0A0A]/60">Business</th>
                      <th className="px-4 py-3 text-left font-medium text-[#0A0A0A]/60 hidden sm:table-cell">Contact</th>
                      <th className="px-4 py-3 text-left font-medium text-[#0A0A0A]/60 hidden md:table-cell">Email</th>
                      <th className="px-4 py-3 text-left font-medium text-[#0A0A0A]/60 hidden md:table-cell">Phone</th>
                      <th className="px-4 py-3 text-left font-medium text-[#0A0A0A]/60 hidden lg:table-cell">Website</th>
                      <th className="px-4 py-3 text-left font-medium text-[#0A0A0A]/60 hidden sm:table-cell">Business Type</th>
                      <th className="px-4 py-3 text-left font-medium text-[#0A0A0A]/60 hidden md:table-cell">Est. Volume</th>
                      <th className="px-4 py-3 text-left font-medium text-[#0A0A0A]/60 hidden sm:table-cell">Signed Up</th>
                      <th className="px-4 py-3 text-left font-medium text-[#0A0A0A]/60"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E1DB]">
                    {partnerOrgs.map(org => (
                      <tr key={org.id} className="bg-white hover:bg-[#F9F7F4] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#0A0A0A]">{org.name}</td>
                        <td className="px-4 py-3 text-[#0A0A0A]/70 hidden sm:table-cell">{org.contactPerson}</td>
                        <td className="px-4 py-3 text-[#0A0A0A]/70 hidden md:table-cell">{org.email}</td>
                        <td className="px-4 py-3 text-[#0A0A0A]/70 hidden md:table-cell">{org.phone}</td>
                        <td className="px-4 py-3 text-[#0A0A0A]/70 hidden lg:table-cell">
                          {org.website ? (
                            <a href={org.website} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-70">
                              {org.website.replace(/^https?:\/\//, '')}
                            </a>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-[#0A0A0A]/70 hidden sm:table-cell">
                          {org.partnerMeta?.businessType
                            ? formatBusinessType(org.partnerMeta.businessType)
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-[#0A0A0A]/70 hidden md:table-cell">
                          {org.partnerMeta?.estimatedVolume ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-[#0A0A0A]/60 whitespace-nowrap hidden sm:table-cell">
                          {org.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/clients/${org.id}`}
                            className="text-[#0A0A0A] underline underline-offset-4 text-sm hover:opacity-70 transition-opacity whitespace-nowrap"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

async function getApplications(filter: StatusFilter) {
  return prisma.wholesaleApplication.findMany({
    where: filter === 'ALL' ? {} : { status: filter },
    orderBy: { createdAt: 'desc' },
  })
}

async function getPartnerOrgs() {
  // Get org IDs and their metadata from partner_application audit events
  const auditEvents = await prisma.auditEvent.findMany({
    where: {
      entityType: 'Organization',
      action: 'partner_application',
    },
    select: { entityId: true, metadata: true },
  })

  const orgIds = auditEvents.map(e => e.entityId)
  const metadataByOrgId = Object.fromEntries(
    auditEvents.map(e => [e.entityId, e.metadata as Record<string, string> | null])
  )

  const orgs = await prisma.organization.findMany({
    where: { id: { in: orgIds } },
    orderBy: { createdAt: 'desc' },
  })

  return orgs.map(org => ({
    ...org,
    partnerMeta: metadataByOrgId[org.id] ?? null,
  }))
}
