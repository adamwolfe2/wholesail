import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrRep } from '@/lib/auth/require-admin'
import { getOverdueReorders } from '@/lib/smart-reorder'

export async function GET(_req: NextRequest) {
  const { error } = await requireAdminOrRep()
  if (error) return error

  try {
    const results = await getOverdueReorders()
    return NextResponse.json({ results })
  } catch (err) {
    console.error('GET /api/admin/smart-reorder error:', err)
    return NextResponse.json({ error: 'Failed to load reorder alerts' }, { status: 500 })
  }
}
