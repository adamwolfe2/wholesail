'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DollarSign,
  Package,
  TrendingUp,
  ShoppingBag,
  Loader2,
  Wand2,
  CreditCard,
  RefreshCw,
  Star,
} from 'lucide-react'
import { PortalLayout } from '@/components/portal-nav'
import { AIOrderParser } from '@/components/ai-order-parser'
import { OnboardingBanner } from '@/components/onboarding-banner'
import { motion } from 'framer-motion'
import { fadeUp, scaleUp, staggerContainer } from '@/lib/animations'

interface DashboardStats {
  orderCount: number
  totalSpent: number
  lastOrderDate: string | null
}

interface DashboardOrder {
  id: string
  date: string
  items: number
  total: number
  status: string
}

interface TopProduct {
  name: string
  orders: number
  revenue: number
  daysSinceLastOrder?: number
  lastQuantity?: number
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function QuickReorderCard({ product }: { product: TopProduct }) {
  const [qty, setQty] = useState(product.lastQuantity ?? 1)
  const slug = slugify(product.name)

  return (
    <div className="border border-shell bg-cream p-4 flex flex-col gap-3 min-w-[180px]">
      <div>
        <p className="font-medium text-sm text-ink leading-snug">{product.name}</p>
        {product.daysSinceLastOrder !== undefined && (
          <p className="text-xs text-ink/40 mt-0.5">
            Last ordered {product.daysSinceLastOrder === 0
              ? 'today'
              : `${product.daysSinceLastOrder}d ago`}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="h-7 w-7 border border-sand text-ink text-sm flex items-center justify-center hover:bg-sand/20 transition-colors"
          aria-label="Decrease quantity"
        >
          &minus;
        </button>
        <span className="text-sm font-semibold text-ink w-6 text-center tabular-nums">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="h-7 w-7 border border-sand text-ink text-sm flex items-center justify-center hover:bg-sand/20 transition-colors"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <Button
        asChild
        size="sm"
        className="bg-ink text-cream hover:bg-ink/80 rounded-none text-xs min-h-[36px]"
      >
        <Link href={`/catalog?product=${slug}&qty=${qty}`}>
          Add to Order
        </Link>
      </Button>
    </div>
  )
}

interface MonthlyRevenue {
  month: string
  revenue: number
}

interface CreditStatus {
  limit: number | null
  used: number
  available: number | null
  utilizationPct: number | null
  isAtLimit: boolean
  isNearLimit: boolean
}

interface LoyaltyStatus {
  currentPoints: number
  lifetimePoints: number
  dollarValue: number
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
}

const tierBadgeStyles: Record<LoyaltyStatus['tier'], string> = {
  Bronze: 'bg-amber-100 text-amber-800 border-amber-300',
  Silver: 'bg-gray-100 text-gray-700 border-gray-300',
  Gold: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  Platinum: 'bg-purple-100 text-purple-800 border-purple-300',
}

export default function ClientDashboard() {
  const { user, isLoaded } = useUser()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [orders, setOrders] = useState<DashboardOrder[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([])
  const [aiParserOpen, setAiParserOpen] = useState(false)
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null)
  const [loyaltyStatus, setLoyaltyStatus] = useState<LoyaltyStatus | null>(null)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, dashRes, creditRes, loyaltyRes] = await Promise.all([
          fetch('/api/client/stats'),
          fetch('/api/client/dashboard'),
          fetch('/api/client/credit'),
          fetch('/api/client/loyalty'),
        ])

        if (statsRes.ok) {
          const data = await statsRes.json()
          if (data.orderCount > 0) setStats(data)
        }

        if (dashRes.ok) {
          const data = await dashRes.json()
          if (data.orders?.length > 0) {
            setOrders(data.orders)
            setTopProducts(data.topProducts || [])
            setMonthlyRevenue(data.monthlyRevenue || [])
          }
        }

        if (creditRes.ok) {
          const data = await creditRes.json()
          // Show credit card if limit is set or there is outstanding balance
          if (data.limit !== null || data.used > 0) {
            setCreditStatus(data)
          }
        }

        if (loyaltyRes.ok) {
          const data = await loyaltyRes.json()
          setLoyaltyStatus(data)
        }
      } catch {
        setFetchError(true)
      }
    }
    if (isLoaded && user) fetchData()
  }, [isLoaded, user])

  if (!isLoaded) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-sand mx-auto mb-4" />
            <p className="text-ink/50">Loading dashboard...</p>
          </div>
        </div>
      </PortalLayout>
    )
  }

  const displayName = user?.firstName || 'there'
  const hasOrders = stats && stats.orderCount > 0
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1)

  // Top 3 products for quick reorder (only those with recency data)
  const quickReorderProducts = topProducts.slice(0, 3).filter(
    (p) => p.daysSinceLastOrder !== undefined
  )

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
      case 'PAID':
        return 'bg-ink text-cream border-ink'
      case 'PENDING':
        return 'bg-transparent text-ink/60 border-sand'
      case 'CONFIRMED':
      case 'PROCESSING':
        return 'bg-sand/30 text-ink border-sand'
      case 'SHIPPED':
        return 'bg-ink/80 text-cream border-ink/70'
      case 'CANCELLED':
        return 'bg-transparent text-ink/40 border-sand/50'
      default:
        return 'bg-transparent text-ink/60 border-sand'
    }
  }

  return (
    <PortalLayout>
      <div>
        {fetchError && (
          <div className="mb-4 rounded-none border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Unable to load data. Please refresh the page or try again later.
          </div>
        )}

        {/* Onboarding Banner — shown until dismissed */}
        <OnboardingBanner orderCount={stats?.orderCount ?? 0} />

        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink mb-1">
              Welcome back, {displayName}
            </h1>
            <p className="text-sm text-ink/50">
              Here&apos;s an overview of your account and recent activity
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setAiParserOpen(true)}
              className="flex-1 sm:flex-none border-ink text-ink hover:bg-ink hover:text-cream min-h-[44px]"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              AI Order
            </Button>
            <Button
              asChild
              className="flex-1 sm:flex-none bg-ink text-cream hover:bg-ink/80 min-h-[44px]"
            >
              <Link href="/catalog">
                <ShoppingBag className="h-4 w-4 mr-2" />
                New Order
              </Link>
            </Button>
          </div>
        </div>

        {!hasOrders ? (
          /* Onboarding empty state */
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="border border-shell bg-white p-8 text-center"
          >
            <Package className="h-8 w-8 text-sand mx-auto mb-3" />
            <p className="font-serif text-lg text-ink mb-1">No orders yet</p>
            <p className="text-sm text-ink/50 mb-4">Browse our catalog and place your first order.</p>
            <Button asChild className="bg-ink text-cream hover:bg-ink/80 rounded-none">
              <Link href="/catalog">Browse Products</Link>
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Quick Reorder */}
            {quickReorderProducts.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <RefreshCw className="h-4 w-4 text-sand" />
                  <h2 className="font-serif text-lg font-bold text-ink">Quick Reorder</h2>
                </div>
                <motion.div
                  className="flex gap-3 overflow-x-auto pb-1"
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                >
                  {quickReorderProducts.map((product) => (
                    <motion.div key={product.name} variants={scaleUp}>
                      <QuickReorderCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* Stats Overview */}
            <motion.div
              className={`grid gap-4 grid-cols-1 sm:grid-cols-2 ${creditStatus || loyaltyStatus ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} mb-6 sm:mb-8`}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={scaleUp}>
                <Card className="border-sand bg-cream">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs sm:text-sm font-medium text-ink/60 uppercase tracking-wider">Total Spend</CardTitle>
                    <DollarSign className="h-4 w-4 text-sand" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-ink">${stats.totalSpent.toLocaleString()}</div>
                    <p className="text-xs text-ink/40 mt-1">All time</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={scaleUp}>
                <Card className="border-sand bg-cream">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs sm:text-sm font-medium text-ink/60 uppercase tracking-wider">Total Orders</CardTitle>
                    <Package className="h-4 w-4 text-sand" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-ink">{stats.orderCount}</div>
                    <p className="text-xs text-ink/40 mt-1">Lifetime orders</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={scaleUp}>
                <Card className="border-sand bg-cream">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs sm:text-sm font-medium text-ink/60 uppercase tracking-wider">Avg Order Value</CardTitle>
                    <TrendingUp className="h-4 w-4 text-sand" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-ink">
                      ${Math.round(stats.totalSpent / stats.orderCount).toLocaleString()}
                    </div>
                    <p className="text-xs text-ink/40 mt-1">Per order</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Loyalty Points Card */}
              {loyaltyStatus && (() => {
                const tierThresholds: Record<LoyaltyStatus['tier'], { next: LoyaltyStatus['tier'] | null; pts: number }> = {
                  Bronze: { next: 'Silver', pts: 500 },
                  Silver: { next: 'Gold', pts: 2000 },
                  Gold: { next: 'Platinum', pts: 5000 },
                  Platinum: { next: null, pts: 5000 },
                }
                const tierData = tierThresholds[loyaltyStatus.tier]
                const nextTier = tierData.next
                const nextTierPts = tierData.pts
                const prevTierPts: Record<LoyaltyStatus['tier'], number> = {
                  Bronze: 0,
                  Silver: 500,
                  Gold: 2000,
                  Platinum: 5000,
                }
                const prevPts = prevTierPts[loyaltyStatus.tier]
                const lifetimePts = loyaltyStatus.lifetimePoints
                const progress = nextTier
                  ? Math.min((lifetimePts - prevPts) / (nextTierPts - prevPts), 1)
                  : 1

                return (
                  <motion.div key="loyalty" variants={scaleUp}>
                    <Card className="border-sand bg-cream">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs sm:text-sm font-medium text-ink/60 uppercase tracking-wider">
                          Loyalty Points
                        </CardTitle>
                        <Star className="h-4 w-4 text-sand" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-ink">
                          {loyaltyStatus.currentPoints.toLocaleString()}
                        </div>
                        <p className="text-[10px] text-ink/40 mt-0.5">
                          {formatCurrency(loyaltyStatus.currentPoints / 100)} value
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 border ${tierBadgeStyles[loyaltyStatus.tier]}`}
                          >
                            {loyaltyStatus.tier}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] text-ink/40 mb-1">
                            <span>{loyaltyStatus.tier}</span>
                            <span>
                              {nextTier
                                ? `${Math.max(nextTierPts - lifetimePts, 0)} pts to ${nextTier}`
                                : 'Top tier'}
                            </span>
                          </div>
                          <div className="h-1.5 bg-shell w-full">
                            <div
                              className="h-1.5 bg-ink transition-all"
                              style={{ width: `${Math.min(progress * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })()}

              {/* Credit Status Card — shown only when credit limit is set or there is outstanding balance */}
              {creditStatus && (
                <motion.div variants={scaleUp}>
                <Card className={`border bg-cream ${
                  creditStatus.isAtLimit
                    ? 'border-red-400'
                    : creditStatus.isNearLimit
                    ? 'border-amber-400'
                    : 'border-sand'
                }`}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className={`text-xs sm:text-sm font-medium uppercase tracking-wider ${
                      creditStatus.isAtLimit
                        ? 'text-red-600'
                        : creditStatus.isNearLimit
                        ? 'text-amber-600'
                        : 'text-ink/60'
                    }`}>
                      Credit Available
                    </CardTitle>
                    <CreditCard className={`h-4 w-4 ${
                      creditStatus.isAtLimit
                        ? 'text-red-400'
                        : creditStatus.isNearLimit
                        ? 'text-amber-400'
                        : 'text-sand'
                    }`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-xl sm:text-2xl font-bold ${
                      creditStatus.isAtLimit
                        ? 'text-red-600'
                        : creditStatus.isNearLimit
                        ? 'text-amber-600'
                        : 'text-ink'
                    }`}>
                      {creditStatus.limit === null
                        ? 'Unlimited'
                        : formatCurrency(creditStatus.available ?? 0)
                      }
                    </div>

                    {/* Progress bar */}
                    {creditStatus.limit !== null && creditStatus.utilizationPct !== null && (
                      <div className="mt-2 mb-1 h-1.5 bg-shell overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            creditStatus.isAtLimit
                              ? 'bg-red-500'
                              : creditStatus.isNearLimit
                              ? 'bg-amber-400'
                              : 'bg-ink'
                          }`}
                          style={{ width: `${Math.min(creditStatus.utilizationPct, 100)}%` }}
                        />
                      </div>
                    )}

                    {creditStatus.limit !== null ? (
                      creditStatus.isAtLimit ? (
                        <p className="text-xs text-red-600 mt-1 leading-tight">
                          Contact your rep to increase your limit
                        </p>
                      ) : (
                        <p className="text-xs text-ink/40 mt-1">
                          ${creditStatus.used.toLocaleString()} of ${creditStatus.limit.toLocaleString()} used
                        </p>
                      )
                    ) : (
                      <p className="text-xs text-ink/40 mt-1">No limit set</p>
                    )}
                  </CardContent>
                </Card>
                </motion.div>
              )}
            </motion.div>

            {/* Main Content */}
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Orders */}
                <Card className="border-sand bg-cream">
                  <CardHeader className="border-b border-sand/50">
                    <CardTitle className="font-serif text-lg text-ink">Recent Orders</CardTitle>
                    <CardDescription className="text-ink/50">Your latest transactions</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {orders.length > 0 ? (
                      <motion.div
                        className="space-y-3"
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                      >
                        {orders.slice(0, 5).map((order) => (
                          <motion.div key={order.id} variants={fadeUp} className="flex items-center justify-between py-1">
                            <div className="space-y-0.5 min-w-0 mr-3">
                              <p className="text-sm font-medium font-mono text-ink truncate">{order.id}</p>
                              <p className="text-xs text-ink/50">
                                {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} &bull; {order.items} items
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-semibold text-ink">${order.total.toLocaleString()}</p>
                              <Badge variant="outline" className={`text-[10px] mt-0.5 ${getStatusColor(order.status)}`}>
                                {order.status}
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <p className="text-sm text-ink/50 py-4">No recent orders.</p>
                    )}
                    <Button
                      variant="outline"
                      className="w-full mt-4 border-sand text-ink hover:bg-sand/20 min-h-[44px]"
                      asChild
                    >
                      <Link href="/client-portal/orders">View All Orders</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Monthly Spending */}
                {monthlyRevenue.length > 0 && (
                  <Card className="border-sand bg-cream">
                    <CardHeader className="border-b border-sand/50">
                      <CardTitle className="font-serif text-lg text-ink">Monthly Spending</CardTitle>
                      <CardDescription className="text-ink/50">Your spending over the last 7 months</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        {monthlyRevenue.map((month) => (
                          <div key={month.month} className="flex items-center gap-3">
                            <div className="w-10 text-xs font-medium text-ink/50">{month.month}</div>
                            <div className="flex-1 h-7 bg-sand/20 overflow-hidden">
                              <div
                                className="h-full bg-ink transition-all"
                                style={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
                              />
                            </div>
                            <div className="w-16 text-xs font-semibold text-right text-ink">
                              {month.revenue > 0 ? `$${(month.revenue / 1000).toFixed(1)}k` : '$0'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Top Products */}
              {topProducts.length > 0 && (
                <Card className="border-sand bg-cream">
                  <CardHeader className="border-b border-sand/50">
                    <CardTitle className="font-serif text-lg text-ink">Top Products</CardTitle>
                    <CardDescription className="text-ink/50">Your most ordered items</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-sand/50">
                            <TableHead className="text-ink/50 uppercase tracking-wider text-xs">Product</TableHead>
                            <TableHead className="text-right text-ink/50 uppercase tracking-wider text-xs">Orders</TableHead>
                            <TableHead className="text-right text-ink/50 uppercase tracking-wider text-xs">Revenue</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {topProducts.map((product, i) => (
                            <motion.tr
                              key={product.name}
                              className="border-b border-sand/30"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.35, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                            >
                              <TableCell className="font-medium text-ink">{product.name}</TableCell>
                              <TableCell className="text-right text-ink/60">{product.orders}</TableCell>
                              <TableCell className="text-right font-semibold text-ink">
                                ${product.revenue.toLocaleString()}
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
      <AIOrderParser open={aiParserOpen} onOpenChange={setAiParserOpen} />
    </PortalLayout>
  )
}
