import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { ensureReferralCode } from '@/lib/referrals'

// POST /api/client/referrals/generate
// Ensures the authenticated org has a referral code (creates one if needed)
export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      organizationId: true,
      organization: { select: { name: true } },
    },
  })

  if (!user?.organizationId) {
    return NextResponse.json({ error: 'No organization found' }, { status: 404 })
  }

  try {
    const code = await ensureReferralCode(
      user.organizationId,
      user.organization!.name
    )
    return NextResponse.json({ code })
  } catch (error) {
    console.error('Failed to generate referral code:', error)
    return NextResponse.json(
      { error: 'Failed to generate referral code' },
      { status: 500 }
    )
  }
}
