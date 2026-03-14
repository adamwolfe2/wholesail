import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { prisma } from '@/lib/db'
import { WholesaleStatus } from '@prisma/client'
import { parseCursorParams, buildPrismaCursorArgs, buildCursorResponse } from '@/lib/pagination'

// GET /api/admin/wholesale — list all applications, optional ?status= filter
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const statusParam = searchParams.get('status')
  const { cursor, take } = parseCursorParams(req)

  const where = statusParam
    ? { status: statusParam as WholesaleStatus }
    : {}

  const applications = await prisma.wholesaleApplication.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    ...buildPrismaCursorArgs(cursor, take),
  })

  const { data, nextCursor, hasMore } = buildCursorResponse(applications, take)
  return NextResponse.json({ applications: data, nextCursor, hasMore })
}
