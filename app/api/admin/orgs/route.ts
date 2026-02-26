import { NextResponse } from 'next/server'
import { requireAdminOrRep } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'

// GET /api/admin/orgs — list orgs for pickers (only those with a phone number)
export async function GET() {
  const { error } = await requireAdminOrRep()
  if (error) return error

  try {
    const orgs = await prisma.organization.findMany({
      where: {
        phone: { not: '' },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        contactPerson: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ orgs })
  } catch (err) {
    console.error('GET /api/admin/orgs error:', err)
    return NextResponse.json({ error: 'Failed to load orgs' }, { status: 500 })
  }
}
