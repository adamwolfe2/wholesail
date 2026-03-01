import { prisma } from "@/lib/db"
import { sendTierUpgradeEmail } from "@/lib/email/index"
import { sendMessage, toE164 } from "@/lib/integrations/blooio"

const TIER_THRESHOLDS = {
  NEW: 0,
  REPEAT: 5000,
  VIP: 50000,
}

export async function checkAndUpgradeTier(organizationId: string): Promise<void> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      tier: true,
      contactPerson: true,
    },
  })
  if (!org) return

  // Sum all non-cancelled order totals
  const result = await prisma.order.aggregate({
    where: { organizationId, status: { not: "CANCELLED" } },
    _sum: { total: true },
  })
  const totalSpend = Number(result._sum.total ?? 0)

  // Determine new tier based on lifetime spend
  let newTier: "NEW" | "REPEAT" | "VIP" = "NEW"
  if (totalSpend >= TIER_THRESHOLDS.VIP) newTier = "VIP"
  else if (totalSpend >= TIER_THRESHOLDS.REPEAT) newTier = "REPEAT"

  // Only act on upgrades — never downgrade
  const tierOrder: Record<string, number> = { NEW: 0, REPEAT: 1, VIP: 2 }
  if (tierOrder[newTier] <= tierOrder[org.tier]) return

  // After the guard, newTier is guaranteed to be REPEAT or VIP
  const upgradedTier = newTier as "REPEAT" | "VIP"

  // Update tier in DB
  await prisma.organization.update({
    where: { id: organizationId },
    data: { tier: upgradedTier },
  })

  // Write audit event
  await prisma.auditEvent.create({
    data: {
      entityType: "Organization",
      entityId: organizationId,
      action: "tier_upgraded",
      metadata: { previousTier: org.tier, newTier, totalSpend },
    },
  })

  // Send congratulations email + SMS (fire-and-forget)
  const firstName = org.contactPerson?.split(" ")[0] || org.name

  await sendTierUpgradeEmail({
    name: firstName,
    email: org.email,
    businessName: org.name,
    newTier: upgradedTier,
    totalSpend,
  }).catch(console.error)

  const phone = org.phone ? toE164(org.phone) : null
  if (phone) {
    const tierMessage =
      upgradedTier === "VIP"
        ? `You've reached VIP status at Wholesail! Your partnership means everything. Expect priority access and white-glove service. — The Wholesail Team`
        : `You've unlocked Repeat Partner status at Wholesail — thank you for your continued trust. Log in to see your updated pricing. — The Wholesail Team`
    sendMessage({ to: phone, message: tierMessage }).catch(console.error)
  }
}
