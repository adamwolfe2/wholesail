import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrRep } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'
import { parseCursorParams, buildPrismaCursorArgs, buildCursorResponse } from '@/lib/pagination'

// GET /api/admin/orgs — list orgs for pickers (only those with a phone number)
export async function GET(req: NextRequest) {
  const { error } = await requireAdminOrRep()
  if (error) return error

  const { cursor, take } = parseCursorParams(req)

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
      ...buildPrismaCursorArgs(cursor, take),
    })

    const { data, nextCursor, hasMore } = buildCursorResponse(orgs as (typeof orgs[number] & { id: string })[], take)
    return NextResponse.json({ orgs: data, nextCursor, hasMore })
  } catch (err) {
    console.error('GET /api/admin/orgs error:', err)
    return NextResponse.json({ error: 'Failed to load orgs' }, { status: 500 })
  }
}
