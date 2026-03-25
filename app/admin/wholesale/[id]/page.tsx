import type { Metadata } from "next";
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { WholesaleStatus } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { WholesaleReviewActions } from './review-actions'

export const metadata: Metadata = { title: "Wholesale Application Details" };

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

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4">
      <dt className="text-sm font-medium text-ink/50 w-48 shrink-0">{label}</dt>
      <dd className="text-sm text-ink mt-0.5 sm:mt-0">{value || '—'}</dd>
    </div>
  )
}

export default async function WholesaleApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let application: Awaited<ReturnType<typeof prisma.wholesaleApplication.findUnique>> | null = null
  try {
    application = await prisma.wholesaleApplication.findUnique({ where: { id } })
  } catch {
    // DB error
  }

  if (!application) notFound()

  const isReviewed = application.status !== 'PENDING'

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ink/50">
        <Link href="/admin/wholesale" className="hover:text-ink transition-colors">
          Wholesale Applications
        </Link>
        <span>/</span>
        <span className="text-ink">{application.businessName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-normal text-ink">
            {application.businessName}
          </h2>
          <p className="text-sm text-ink/50 mt-1">
            Applied {application.createdAt.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        {statusBadge(application.status)}
      </div>

      {/* Application Details */}
      <div className="border border-shell bg-cream p-6 space-y-4">
        <h3 className="font-serif text-lg font-normal text-ink">Application Details</h3>
        <dl className="space-y-3">
          <DetailRow label="Business Name" value={application.businessName} />
          <DetailRow label="Contact Name" value={application.contactName} />
          <DetailRow label="Email" value={application.email} />
          <DetailRow label="Phone" value={application.phone} />
          <DetailRow label="Website" value={application.website} />
          <DetailRow label="EIN / Tax ID" value={application.taxId} />
          <DetailRow
            label="Business Type"
            value={application.businessType.charAt(0).toUpperCase() + application.businessType.slice(1)}
          />
          <DetailRow label="Years in Business" value={application.yearsInBusiness} />
          <DetailRow label="Monthly Volume" value={application.monthlyVolume} />
          <DetailRow label="Notes" value={application.notes} />
        </dl>
      </div>

      {/* Review Decision (if reviewed) */}
      {isReviewed && (
        <div className="border border-shell bg-cream p-6 space-y-3">
          <h3 className="font-serif text-lg font-normal text-ink">Review Decision</h3>
          <dl className="space-y-3">
            <DetailRow label="Decision" value={application.status} />
            <DetailRow label="Reviewed At" value={
              application.reviewedAt
                ? application.reviewedAt.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                : null
            } />
            <DetailRow label="Review Notes" value={application.reviewNotes} />
          </dl>
          {application.status === 'APPROVED' && application.convertedOrgId && (
            <div className="pt-3 border-t border-shell">
              <p className="text-sm text-ink/60">Organization created:</p>
              <Link
                href={`/admin/clients/${application.convertedOrgId}`}
                className="text-sm text-ink underline underline-offset-4 hover:opacity-70 transition-opacity"
              >
                View Client Profile &rarr;
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Review Actions (pending only) */}
      {!isReviewed && (
        <div className="border border-shell bg-cream p-6 space-y-4">
          <h3 className="font-serif text-lg font-normal text-ink">Review Application</h3>
          <WholesaleReviewActions
            applicationId={application.id}
            currentStatus={application.status}
          />
        </div>
      )}
    </div>
  )
}
