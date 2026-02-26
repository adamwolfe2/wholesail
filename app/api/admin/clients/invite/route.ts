import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getSiteUrl } from '@/lib/get-site-url'


const schema = z.object({
  email: z.string().email(),
  organizationId: z.string(),
  name: z.string().optional(),
  role: z.enum(['CLIENT', 'SALES_REP']).default('CLIENT'),
})

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check admin role via DB — consistent with all other admin routes
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  if (!dbUser || !['ADMIN', 'OPS'].includes(dbUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const { email, organizationId, name, role } = parsed.data

  // Verify org exists
  const org = await prisma.organization.findUnique({ where: { id: organizationId } })
  if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })

  try {
    const clerk = await clerkClient()
    const invitation = await clerk.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: {
        role,
        organizationId,
        organizationName: org.name,
        ...(name ? { displayName: name } : {}),
      },
      redirectUrl: `${getSiteUrl()}/client-portal`,
    })

    return NextResponse.json({ success: true, invitationId: invitation.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send invitation'
    return NextResponse.json({ error: message }, { status: 422 })
  }
}
