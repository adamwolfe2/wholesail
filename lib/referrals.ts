import { prisma } from '@/lib/db'

/**
 * Generate a unique referral code from org name.
 * Format: first 4 alpha chars of org name (uppercase) + "-" + 4 random hex chars
 * e.g., "RITZ-3F7A", "NOMA-A9B2"
 */
export function generateReferralCode(orgName: string): string {
  const prefix = orgName
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 4)
    .padEnd(4, 'X')

  const suffix = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0')

  return `${prefix}-${suffix}`
}

/**
 * Ensure an organization has a referral code.
 * If they don't have one yet, generate one (with collision retry) and persist it.
 * Returns the code.
 */
export async function ensureReferralCode(
  orgId: string,
  orgName: string
): Promise<string> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { referralCode: true },
  })

  if (org?.referralCode) return org.referralCode

  // Try up to 10 times to generate a unique code
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateReferralCode(orgName)
    const existing = await prisma.organization.findUnique({
      where: { referralCode: code },
      select: { id: true },
    })
    if (!existing) {
      await prisma.organization.update({
        where: { id: orgId },
        data: { referralCode: code },
      })
      return code
    }
  }

  // Fallback: use random hex suffix for guaranteed uniqueness
  const fallbackSuffix = Math.random().toString(16).slice(2, 6).toUpperCase().padStart(4, '0')
  const fallbackCode = `${generateReferralCode(orgName).split('-')[0]}-${fallbackSuffix}`
  await prisma.organization.update({
    where: { id: orgId },
    data: { referralCode: fallbackCode },
  })
  return fallbackCode
}

/**
 * Process a referral conversion when a new org places their first order.
 * Finds PENDING referral by refereeEmail, marks CONVERTED → CREDITED,
 * adds $50 credit to referrer, and creates an AuditEvent.
 */
export async function processReferralConversion(
  newOrgId: string,
  refereeEmail: string
): Promise<void> {
  const referral = await prisma.referral.findFirst({
    where: {
      refereeEmail: refereeEmail.toLowerCase(),
      status: 'PENDING',
    },
  })

  if (!referral) return

  const now = new Date()

  // Update referral: CONVERTED then CREDITED (single update)
  await prisma.referral.update({
    where: { id: referral.id },
    data: {
      status: 'CREDITED',
      refereeOrgId: newOrgId,
      creditedAt: now,
    },
  })

  // Add credit to referrer's balance
  await prisma.organization.update({
    where: { id: referral.referrerId },
    data: {
      referralCredits: {
        increment: referral.creditAmount,
      },
    },
  })

  // Log audit event
  await prisma.auditEvent.create({
    data: {
      entityType: 'Referral',
      entityId: referral.id,
      action: 'referral_credited',
      metadata: {
        referrerId: referral.referrerId,
        refereeEmail,
        refereeOrgId: newOrgId,
        creditAmount: Number(referral.creditAmount),
      },
    },
  })
}
