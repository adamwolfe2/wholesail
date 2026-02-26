import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { getOrganizationByUserId } from '@/lib/db/organizations'
import { z } from 'zod'

const schema = z.object({
  distributorCcEmail: z.string().email('Invalid email address').nullable().optional(),
})

// GET /api/distributor/settings — fetch current distributor settings
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const org = await getOrganizationByUserId(userId)
  if (!org || !org.isDistributor) {
    return NextResponse.json({ error: 'Forbidden — not a distributor account.' }, { status: 403 })
  }

  return NextResponse.json({
    name: org.name,
    email: org.email,
    distributorCcEmail: (org as { distributorCcEmail?: string | null }).distributorCcEmail ?? null,
  })
}

// PATCH /api/distributor/settings — update CC email
export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const org = await getOrganizationByUserId(userId)
  if (!org || !org.isDistributor) {
    return NextResponse.json({ error: 'Forbidden — not a distributor account.' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const updated = await prisma.organization.update({
    where: { id: org.id },
    data: { distributorCcEmail: parsed.data.distributorCcEmail ?? null },
  })

  await prisma.auditEvent.create({
    data: {
      entityType: 'Organization',
      entityId: org.id,
      action: 'distributor_cc_email_updated',
      userId,
    },
  })

  return NextResponse.json({ success: true, distributorCcEmail: (updated as { distributorCcEmail?: string | null }).distributorCcEmail })
}
