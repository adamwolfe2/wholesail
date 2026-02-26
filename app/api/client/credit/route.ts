import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getOrganizationByUserId } from '@/lib/db/organizations'
import { getCreditStatus } from '@/lib/credit'

// GET /api/client/credit — returns the org's CreditStatus
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const org = await getOrganizationByUserId(userId)
  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  const creditStatus = await getCreditStatus(org.id)
  const loyaltyPoints = org.loyaltyPoints ?? 0
  return NextResponse.json({
    ...creditStatus,
    referralCredits: Number(org.referralCredits ?? 0),
    loyaltyPoints,
    loyaltyDollarValue: Math.round((loyaltyPoints / 100) * 100) / 100,
  })
}
