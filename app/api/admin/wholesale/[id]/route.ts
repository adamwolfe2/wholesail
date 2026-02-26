import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { sendWelcomePartnerEmail, sendWholesaleRejectionEmail, sendApplicationStatusEmail } from '@/lib/email'
import { clerkClient } from '@clerk/nextjs/server'
import { getSiteUrl } from '@/lib/get-site-url'

// GET /api/admin/wholesale/[id] — single application
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  const application = await prisma.wholesaleApplication.findUnique({
    where: { id },
  })

  if (!application) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ application })
}

const reviewSchema = z.object({
  action: z.enum(['approve', 'reject', 'waitlist']),
  reviewNotes: z.string().optional(),
})

// PATCH /api/admin/wholesale/[id] — review an application
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { action, reviewNotes } = parsed.data

  const app = await prisma.wholesaleApplication.findUnique({ where: { id } })
  if (!app) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (action === 'approve') {
    // 1. Create Organization
    const isDistributorApplicant = app.businessType?.toLowerCase() === 'distributor'
    const org = await prisma.organization.create({
      data: {
        name: app.businessName,
        contactPerson: app.contactName,
        email: app.email,
        phone: app.phone,
        website: app.website,
        isWholesaler: !isDistributorApplicant,
        isDistributor: isDistributorApplicant,
        tier: 'VIP',
        paymentTerms: 'Net-30',
      },
    })

    // 2. Update application
    const updated = await prisma.wholesaleApplication.update({
      where: { id },
      data: {
        status: 'APPROVED',
        convertedOrgId: org.id,
        reviewNotes: reviewNotes ?? null,
        reviewedById: userId,
        reviewedAt: new Date(),
      },
    })

    // 3. Audit event
    await prisma.auditEvent.create({
      data: {
        entityType: 'WholesaleApplication',
        entityId: id,
        action: 'wholesale_approved',
        userId,
        metadata: { organizationId: org.id, businessName: app.businessName },
      },
    })

    // 4. Send welcome email
    await sendWelcomePartnerEmail({
      name: app.contactName,
      email: app.email,
      businessName: app.businessName,
    })

    // 5. Send Clerk invite (non-fatal)
    try {
      const clerk = await clerkClient()
      await clerk.invitations.createInvitation({
        emailAddress: app.email,
        publicMetadata: { organizationId: org.id, organizationName: org.name, role: 'CLIENT' },
        redirectUrl: getSiteUrl() + '/sign-up',
      })
    } catch (clerkErr) {
      console.warn('Clerk invitation failed (non-fatal):', clerkErr)
    }

    return NextResponse.json({ success: true, application: updated, organization: org })
  }

  if (action === 'reject') {
    const updated = await prisma.wholesaleApplication.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewNotes: reviewNotes ?? null,
        reviewedById: userId,
        reviewedAt: new Date(),
      },
    })

    await prisma.auditEvent.create({
      data: {
        entityType: 'WholesaleApplication',
        entityId: id,
        action: 'wholesale_rejected',
        userId,
        metadata: { businessName: app.businessName },
      },
    })

    await sendWholesaleRejectionEmail({
      contactName: app.contactName,
      businessName: app.businessName,
      email: app.email,
    })

    return NextResponse.json({ success: true, application: updated })
  }

  // waitlist
  const updated = await prisma.wholesaleApplication.update({
    where: { id },
    data: {
      status: 'WAITLISTED',
      reviewNotes: reviewNotes ?? null,
      reviewedById: userId,
      reviewedAt: new Date(),
    },
  })

  await prisma.auditEvent.create({
    data: {
      entityType: 'WholesaleApplication',
      entityId: id,
      action: 'wholesale_waitlisted',
      userId,
      metadata: { businessName: app.businessName },
    },
  })

  await sendApplicationStatusEmail({
    contactName: app.contactName,
    businessName: app.businessName,
    email: app.email,
    status: 'WAITLISTED',
  })

  return NextResponse.json({ success: true, application: updated })
}
