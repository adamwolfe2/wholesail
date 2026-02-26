'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
    <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-4 flex flex-col gap-3 min-w-[180px]">
      <div>
        <p className="font-medium text-sm text-[#0A0A0A] leading-snug">{product.name}</p>
        {product.daysSinceLastOrder !== undefined && (
          <p className="text-xs text-[#0A0A0A]/40 mt-0.5">
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
          className="h-7 w-7 border border-[#C8C0B4] text-[#0A0A0A] text-sm flex items-center justify-center hover:bg-[#C8C0B4]/20 transition-colors"
          aria-label="Decrease quantity"
        >
          &minus;
        </button>
        <span className="text-sm font-semibold text-[#0A0A0A] w-6 text-center tabular-nums">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="h-7 w-7 border border-[#C8C0B4] text-[#0A0A0A] text-sm flex items-center justify-center hover:bg-[#C8C0B4]/20 transition-colors"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <Button
        asChild
        size="sm"
        className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none text-xs min-h-[36px]"
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
        // DB not connected
      }
    }
    if (isLoaded && user) fetchData()
  }, [isLoaded, user])

  if (!isLoaded) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#C8C0B4] mx-auto mb-4" />
            <p className="text-[#0A0A0A]/50">Loading dashboard...</p>
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
        return 'bg-[#0A0A0A] text-[#F9F7F4] border-[#0A0A0A]'
      case 'PENDING':
        return 'bg-transparent text-[#0A0A0A]/60 border-[#C8C0B4]'
      case 'CONFIRMED':
      case 'PROCESSING':
        return 'bg-[#C8C0B4]/30 text-[#0A0A0A] border-[#C8C0B4]'
      case 'SHIPPED':
        return 'bg-[#0A0A0A]/80 text-[#F9F7F4] border-[#0A0A0A]/70'
      case 'CANCELLED':
        return 'bg-transparent text-[#0A0A0A]/40 border-[#C8C0B4]/50'
      default:
        return 'bg-transparent text-[#0A0A0A]/60 border-[#C8C0B4]'
    }
  }

  return (
    <PortalLayout>
      <div>
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A] mb-1">
              Welcome back, {displayName}
            </h1>
            <p className="text-sm text-[#0A0A0A]/50">
              Here&apos;s an overview of your account and recent activity
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setAiParserOpen(true)}
              className="flex-1 sm:flex-none border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#F9F7F4] min-h-[44px]"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              AI Order
            </Button>
            <Button
              asChild
              className="flex-1 sm:flex-none bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 min-h-[44px]"
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
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-xs tracking-widest uppercase text-[#C8C0B4] mb-4">No orders yet</p>
            <h2 className="font-serif text-3xl mb-4 text-[#0A0A0A]">Ready to place your first order?</h2>
            <p className="text-[#0A0A0A]/50 mb-8 max-w-md">Browse our catalog of truffles, caviar, and specialty foods.</p>
            <Button asChild className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none min-h-[44px]">
              <Link href="/catalog">Browse Catalog</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Quick Reorder */}
            {quickReorderProducts.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <RefreshCw className="h-4 w-4 text-[#C8C0B4]" />
                  <h2 className="font-serif text-lg font-bold text-[#0A0A0A]">Quick Reorder</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {quickReorderProducts.map((product) => (
                    <QuickReorderCard key={product.name} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Stats Overview */}
            <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 ${creditStatus || loyaltyStatus ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} mb-6 sm:mb-8`}>
              <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-[#0A0A0A]/60 uppercase tracking-wider">Total Spend</CardTitle>
                  <DollarSign className="h-4 w-4 text-[#C8C0B4]" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">${stats.totalSpent.toLocaleString()}</div>
                  <p className="text-xs text-[#0A0A0A]/40 mt-1">All time</p>
                </CardContent>
              </Card>

              <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-[#0A0A0A]/60 uppercase tracking-wider">Total Orders</CardTitle>
                  <Package className="h-4 w-4 text-[#C8C0B4]" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">{stats.orderCount}</div>
                  <p className="text-xs text-[#0A0A0A]/40 mt-1">Lifetime orders</p>
                </CardContent>
              </Card>

              <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-[#0A0A0A]/60 uppercase tracking-wider">Avg Order Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-[#C8C0B4]" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">
                    ${Math.round(stats.totalSpent / stats.orderCount).toLocaleString()}
                  </div>
                  <p className="text-xs text-[#0A0A0A]/40 mt-1">Per order</p>
                </CardContent>
              </Card>

              {/* Loyalty Points Card */}
              {loyaltyStatus && (
                <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs sm:text-sm font-medium text-[#0A0A0A]/60 uppercase tracking-wider">
                      Loyalty Points
                    </CardTitle>
                    <Star className="h-4 w-4 text-[#C8C0B4]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">
                      {loyaltyStatus.currentPoints.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 border ${tierBadgeStyles[loyaltyStatus.tier]}`}
                      >
                        {loyaltyStatus.tier}
                      </Badge>
                      <p className="text-xs text-[#0A0A0A]/40">
                        = ${loyaltyStatus.dollarValue.toFixed(2)} in credits
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Credit Status Card — shown only when credit limit is set or there is outstanding balance */}
              {creditStatus && (
                <Card className={`border bg-[#F9F7F4] ${
                  creditStatus.isAtLimit
                    ? 'border-red-400'
                    : creditStatus.isNearLimit
                    ? 'border-amber-400'
                    : 'border-[#C8C0B4]'
                }`}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className={`text-xs sm:text-sm font-medium uppercase tracking-wider ${
                      creditStatus.isAtLimit
                        ? 'text-red-600'
                        : creditStatus.isNearLimit
                        ? 'text-amber-600'
                        : 'text-[#0A0A0A]/60'
                    }`}>
                      Credit Available
                    </CardTitle>
                    <CreditCard className={`h-4 w-4 ${
                      creditStatus.isAtLimit
                        ? 'text-red-400'
                        : creditStatus.isNearLimit
                        ? 'text-amber-400'
                        : 'text-[#C8C0B4]'
                    }`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-xl sm:text-2xl font-bold ${
                      creditStatus.isAtLimit
                        ? 'text-red-600'
                        : creditStatus.isNearLimit
                        ? 'text-amber-600'
                        : 'text-[#0A0A0A]'
                    }`}>
                      {creditStatus.limit === null
                        ? 'Unlimited'
                        : `$${(creditStatus.available ?? 0).toLocaleString()}`
                      }
                    </div>

                    {/* Progress bar */}
                    {creditStatus.limit !== null && creditStatus.utilizationPct !== null && (
                      <div className="mt-2 mb-1 h-1.5 bg-[#E5E1DB] overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            creditStatus.isAtLimit
                              ? 'bg-red-500'
                              : creditStatus.isNearLimit
                              ? 'bg-amber-400'
                              : 'bg-[#0A0A0A]'
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
                        <p className="text-xs text-[#0A0A0A]/40 mt-1">
                          ${creditStatus.used.toLocaleString()} of ${creditStatus.limit.toLocaleString()} used
                        </p>
                      )
                    ) : (
                      <p className="text-xs text-[#0A0A0A]/40 mt-1">No limit set</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Orders */}
                <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
                  <CardHeader className="border-b border-[#C8C0B4]/50">
                    <CardTitle className="font-serif text-lg text-[#0A0A0A]">Recent Orders</CardTitle>
                    <CardDescription className="text-[#0A0A0A]/50">Your latest transactions</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {orders.length > 0 ? (
                      <div className="space-y-3">
                        {orders.slice(0, 5).map((order) => (
                          <div key={order.id} className="flex items-center justify-between py-1">
                            <div className="space-y-0.5 min-w-0 mr-3">
                              <p className="text-sm font-medium font-mono text-[#0A0A0A] truncate">{order.id}</p>
                              <p className="text-xs text-[#0A0A0A]/50">
                                {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} &bull; {order.items} items
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-semibold text-[#0A0A0A]">${order.total.toLocaleString()}</p>
                              <Badge variant="outline" className={`text-[10px] mt-0.5 ${getStatusColor(order.status)}`}>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#0A0A0A]/50 py-4">No recent orders.</p>
                    )}
                    <Button
                      variant="outline"
                      className="w-full mt-4 border-[#C8C0B4] text-[#0A0A0A] hover:bg-[#C8C0B4]/20 min-h-[44px]"
                      asChild
                    >
                      <Link href="/client-portal/orders">View All Orders</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Monthly Spending */}
                {monthlyRevenue.length > 0 && (
                  <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
                    <CardHeader className="border-b border-[#C8C0B4]/50">
                      <CardTitle className="font-serif text-lg text-[#0A0A0A]">Monthly Spending</CardTitle>
                      <CardDescription className="text-[#0A0A0A]/50">Your spending over the last 7 months</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        {monthlyRevenue.map((month) => (
                          <div key={month.month} className="flex items-center gap-3">
                            <div className="w-10 text-xs font-medium text-[#0A0A0A]/50">{month.month}</div>
                            <div className="flex-1 h-7 bg-[#C8C0B4]/20 overflow-hidden">
                              <div
                                className="h-full bg-[#0A0A0A] transition-all"
                                style={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
                              />
                            </div>
                            <div className="w-16 text-xs font-semibold text-right text-[#0A0A0A]">
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
                <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
                  <CardHeader className="border-b border-[#C8C0B4]/50">
                    <CardTitle className="font-serif text-lg text-[#0A0A0A]">Top Products</CardTitle>
                    <CardDescription className="text-[#0A0A0A]/50">Your most ordered items</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-[#C8C0B4]/50">
                            <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Product</TableHead>
                            <TableHead className="text-right text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Orders</TableHead>
                            <TableHead className="text-right text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Revenue</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {topProducts.map((product) => (
                            <TableRow key={product.name} className="border-[#C8C0B4]/30">
                              <TableCell className="font-medium text-[#0A0A0A]">{product.name}</TableCell>
                              <TableCell className="text-right text-[#0A0A0A]/60">{product.orders}</TableCell>
                              <TableCell className="text-right font-semibold text-[#0A0A0A]">
                                ${product.revenue.toLocaleString()}
                              </TableCell>
                            </TableRow>
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
