import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getSiteUrl } from '@/lib/get-site-url'
import { requireAdmin } from '@/lib/auth/require-admin'


const schema = z.object({
  email: z.string().email(),
  organizationId: z.string(),
  name: z.string().optional(),
  role: z.enum(['CLIENT', 'SALES_REP']).default('CLIENT'),
})

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

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
