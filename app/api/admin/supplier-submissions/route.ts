import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function GET() {
  try {
    const { error: authError } = await requireAdmin()
    if (authError) return authError

    const submissions = await prisma.supplierSubmission.findMany({
      include: {
        supplier: {
          select: { name: true, email: true, country: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('Error fetching supplier submissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
