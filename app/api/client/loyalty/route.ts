import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { getLoyaltyStatus } from '@/lib/loyalty'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const status = await getLoyaltyStatus(user.organizationId)
    return NextResponse.json(status)
  } catch (error) {
    console.error('Error fetching loyalty status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
