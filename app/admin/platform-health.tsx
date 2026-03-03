import Link from 'next/link'
import { prisma } from '@/lib/db'
import {
  CheckCircle2, AlertCircle, ArrowRight, Sparkles,
  Truck, Package, Users, Settings2, Zap,
} from 'lucide-react'

interface HealthItem {
  ok: boolean
  label: string
  detail?: string
  link?: string
  icon: React.ElementType
}

export async function PlatformHealthCard() {
  let items: HealthItem[] = []
  let allOk = false

  try {
    const [
      productCount,
      distributorCount,
      productsWithoutDistributor,
      orgsWithNoMembers,
      pricingRules,
      ordersNeedingConfirm,
    ] = await Promise.all([
      prisma.product.count({ where: { available: true } }),
      prisma.organization.count({ where: { isDistributor: true } }),
      prisma.product.count({ where: { available: true, distributorOrgId: null } }),
      prisma.organization.count({ where: { members: { none: {} } } }),
      prisma.pricingRule.count({ where: { isActive: true } }).catch(() => 0),
      prisma.order.count({ where: { adminConfirmedAt: null, status: { in: ['CONFIRMED', 'PACKED', 'SHIPPED'] } } }),
    ])

    items = [
      {
        ok: productCount > 0,
        label: productCount > 0 ? `${productCount} products in catalog` : 'No products added yet',
        detail: productCount === 0 ? 'Add products to the catalog before inviting clients' : undefined,
        link: '/admin/products',
        icon: Package,
      },
      {
        ok: distributorCount > 0,
        label: distributorCount > 0 ? `${distributorCount} distributor${distributorCount > 1 ? 's' : ''} configured` : 'No distributors set up',
        detail: distributorCount === 0 ? 'Go to a client org → enable "Is Distributor" to create a fulfillment partner' : undefined,
        link: '/admin/clients',
        icon: Truck,
      },
      {
        ok: productsWithoutDistributor === 0,
        label: productsWithoutDistributor === 0
          ? 'All products have a distributor assigned'
          : `${productsWithoutDistributor} product${productsWithoutDistributor > 1 ? 's' : ''} missing distributor`,
        detail: productsWithoutDistributor > 0 ? 'Open each product → Distributor Assignment to route orders correctly' : undefined,
        link: productsWithoutDistributor > 0 ? '/admin/products' : undefined,
        icon: Truck,
      },
      {
        ok: pricingRules > 0,
        label: pricingRules > 0 ? `Pricing rules configured (${pricingRules} active)` : 'No pricing tiers set',
        detail: pricingRules === 0 ? 'Set NEW / REPEAT / VIP discount tiers at /admin/pricing' : undefined,
        link: '/admin/pricing',
        icon: Settings2,
      },
      {
        ok: orgsWithNoMembers === 0,
        label: orgsWithNoMembers === 0
          ? 'All partner orgs have portal access'
          : `${orgsWithNoMembers} partner org${orgsWithNoMembers > 1 ? 's' : ''} not yet invited`,
        detail: orgsWithNoMembers > 0 ? 'Go to each client org → Invite button to send portal access' : undefined,
        link: orgsWithNoMembers > 0 ? '/admin/clients' : undefined,
        icon: Users,
      },
      {
        ok: ordersNeedingConfirm === 0,
        label: ordersNeedingConfirm === 0
          ? 'Delivery confirmations up to date'
          : `${ordersNeedingConfirm} order${ordersNeedingConfirm > 1 ? 's' : ''} need your delivery confirmation`,
        detail: ordersNeedingConfirm > 0 ? 'Open each order → mark step 1 of the 3-step delivery checklist' : undefined,
        link: ordersNeedingConfirm > 0 ? '/admin/orders' : undefined,
        icon: CheckCircle2,
      },
    ]

    allOk = items.every(i => i.ok)
  } catch {
    return null
  }

  return (
    <div className="border border-[#E5E1DB] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E1DB]">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${allOk ? 'bg-green-500' : 'bg-amber-400'}`} />
          <h3 className="text-sm font-semibold text-[#0A0A0A]">Platform Setup</h3>
        </div>
        <Link
          href="/admin/chat"
          className="flex items-center gap-1.5 text-xs text-[#0A0A0A]/50 hover:text-[#0A0A0A] transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Ask AI for help
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Items */}
      <div className="divide-y divide-[#E5E1DB]">
        {items.map((item, i) => (
          <HealthItemRow key={i} item={item} />
        ))}
      </div>

      {/* Footer */}
      {allOk && (
        <div className="px-5 py-3 bg-[#F9F7F4] border-t border-[#E5E1DB]">
          <p className="text-xs text-[#0A0A0A]/50 flex items-center gap-1.5">
            <Zap className="h-3 w-3" />
            Platform fully configured. Your AI assistant is ready to help you operate.
          </p>
        </div>
      )}
    </div>
  )
}

function HealthItemRow({ item }: { item: HealthItem }) {
  const Icon = item.icon
  const content = (
    <div className={`flex items-center gap-3 px-5 py-3 ${!item.ok && item.link ? 'hover:bg-[#F9F7F4] transition-colors group' : ''}`}>
      {item.ok ? (
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
      )}
      <Icon className="h-3.5 w-3.5 text-[#0A0A0A]/30 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium ${item.ok ? 'text-[#0A0A0A]/60' : 'text-[#0A0A0A]'}`}>
          {item.label}
        </p>
        {item.detail && (
          <p className="text-[10px] text-[#0A0A0A]/40 mt-0.5">{item.detail}</p>
        )}
      </div>
      {!item.ok && item.link && (
        <ArrowRight className="h-3.5 w-3.5 text-[#0A0A0A]/30 shrink-0 group-hover:translate-x-0.5 transition-transform" />
      )}
    </div>
  )

  if (!item.ok && item.link) {
    return <Link href={item.link}>{content}</Link>
  }
  return <div>{content}</div>
}
