'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { PortalLayout } from '@/components/portal-nav'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart,
  Area,
  AreaChart,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingBag,
  BarChart3,
  Loader2,
  CalendarDays,
  RefreshCcw,
  Download,
  Tag,
  Star,
} from 'lucide-react'

interface AnalyticsData {
  monthlyRevenue: { month: string; revenue: number }[]
  topProducts: { name: string; revenue: number; orders: number }[]
  topProductsAllTime: { name: string; revenue: number; orders: number }[]
  categoryBreakdown: { category: string; value: number }[]
  categoryBreakdownEnhanced: { category: string; total: number; count: number }[]
  orderFrequency: { week: string; orders: number }[]
  yearOverYear: { thisYear: number; lastYear: number; change: number | null }
  avgOrderCycleDays: number | null
  orderCalendar: { date: string; count: number }[]
  kpis: {
    totalSpent: number
    avgMonthly: number
    topCategory: string
    topCategoryPct: number
    avgWeeklyOrders: string
  }
}

interface PricingTierData {
  tier: 'NEW' | 'REPEAT' | 'VIP'
  lifetimeSpend: number
  discounts: { category: string; discountPct: number }[]
  nextTier: 'REPEAT' | 'VIP' | null
  spendToNextTier: number | null
}

const TIER_NEXT_THRESHOLD: Record<string, number> = {
  NEW: 5000,
  REPEAT: 50000,
}

const tierBadgeColors: Record<string, string> = {
  NEW: 'bg-[#E5E1DB] text-[#0A0A0A] border-0',
  REPEAT: 'bg-[#DBEAFE] text-[#1E40AF] border-0',
  VIP: 'bg-[#FEF3C7] text-[#92400E] border-0',
}

// Build a 52-week × 7-day calendar grid from orderCalendar data
function buildCalendarGrid(
  orderCalendar: { date: string; count: number }[]
): { date: string; count: number; week: number; day: number }[] {
  const calMap = new Map<string, number>()
  for (const entry of orderCalendar) {
    calMap.set(entry.date, entry.count)
  }

  const today = new Date()
  const cells: { date: string; count: number; week: number; day: number }[] = []

  // Go back 364 days (52 weeks) from today
  for (let w = 51; w >= 0; w--) {
    for (let d = 0; d < 7; d++) {
      const daysBack = w * 7 + (6 - d)
      const date = new Date(today)
      date.setDate(today.getDate() - daysBack)
      const dateKey = date.toISOString().slice(0, 10)
      cells.push({
        date: dateKey,
        count: calMap.get(dateKey) || 0,
        week: 51 - w,
        day: d,
      })
    }
  }
  return cells
}

function calendarColor(count: number): string {
  if (count === 0) return '#E5E1DB'
  if (count === 1) return '#C8C0B4'
  if (count === 2) return '#8B7F74'
  if (count <= 4) return '#3D3530'
  return '#0A0A0A'
}

export default function AnalyticsPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [pricingTier, setPricingTier] = useState<PricingTierData | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      setLoading(false)
      return
    }

    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/client/analytics')
        if (res.ok) {
          const json = await res.json()
          if (json.data && json.data.monthlyRevenue?.length > 0) {
            setAnalytics(json.data)
          }
        }
      } catch {
        // silently fail — empty state shows
      } finally {
        setLoading(false)
      }
    }

    async function fetchPricingTier() {
      try {
        const res = await fetch('/api/client/pricing-tier')
        if (res.ok) {
          const json = await res.json()
          setPricingTier(json)
        }
      } catch {
        // silently fail
      }
    }

    fetchAnalytics()
    fetchPricingTier()
  }, [isLoaded, isSignedIn])

  if (!isLoaded || loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#C8C0B4]" />
        </div>
      </PortalLayout>
    )
  }

  if (!analytics) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
              Analytics
            </h1>
            <p className="text-sm text-[#0A0A0A]/50 mt-1">
              Insights into your spending and ordering patterns
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-xs tracking-widest uppercase text-[#C8C0B4] mb-4">
              No data yet
            </p>
            <h2 className="font-serif text-3xl mb-4 text-[#0A0A0A]">
              Place your first order to see analytics
            </h2>
            <p className="text-[#0A0A0A]/50 mb-8 max-w-md">
              Once you have orders, you&apos;ll see insights on spending trends, top
              products, and order patterns.
            </p>
            <Button
              asChild
              className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none min-h-[44px]"
            >
              <Link href="/catalog">Browse Catalog</Link>
            </Button>
          </div>
        </div>
      </PortalLayout>
    )
  }

  const {
    monthlyRevenue,
    topProducts,
    topProductsAllTime,
    categoryBreakdown,
    orderFrequency,
    yearOverYear,
    avgOrderCycleDays,
    orderCalendar,
    kpis,
  } = analytics

  const totalRevenue = kpis.totalSpent
  const avgMonthly = kpis.avgMonthly
  const topCategory = kpis.topCategory
  const topCategoryPct = kpis.topCategoryPct
  const avgWeeklyOrders = kpis.avgWeeklyOrders

  // Month-over-month change
  let monthChange = 0
  if (monthlyRevenue.length >= 2) {
    const lastMonth = monthlyRevenue[monthlyRevenue.length - 1].revenue
    const prevMonth = monthlyRevenue[monthlyRevenue.length - 2].revenue
    monthChange =
      prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : 0
  }

  // Brand-palette pie fills: black to stone grey gradient
  const pieFills = ['#0A0A0A', '#3D3530', '#6B5E58', '#C8C0B4', '#E8E4DF']

  // Build calendar grid
  const calendarCells = buildCalendarGrid(orderCalendar || [])

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">
              Analytics
            </h1>
            <p className="text-sm text-[#0A0A0A]/50 mt-1">
              Insights into your spending and ordering patterns
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-[#C8C0B4] text-[#0A0A0A] hover:bg-[#F9F7F4] rounded-none text-xs tracking-wider uppercase h-9 px-4"
          >
            <Link href="/api/client/statement" target="_blank">
              <Download className="h-3.5 w-3.5 mr-2" />
              Account Statement
            </Link>
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
                12-Month Spend
              </CardTitle>
              <DollarSign className="h-4 w-4 text-[#C8C0B4]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#0A0A0A]">
                ${(totalRevenue / 1000).toFixed(0)}k
              </div>
              <div className="flex items-center gap-1 mt-1">
                {monthChange >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-[#0A0A0A]" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-[#0A0A0A]/40" />
                )}
                <span
                  className={`text-xs ${monthChange >= 0 ? 'text-[#0A0A0A]' : 'text-[#0A0A0A]/40'}`}
                >
                  {monthChange >= 0 ? '+' : ''}
                  {monthChange.toFixed(1)}% vs prior month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
                Avg Monthly
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-[#C8C0B4]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#0A0A0A]">
                ${(avgMonthly / 1000).toFixed(1)}k
              </div>
              <p className="text-xs text-[#0A0A0A]/40 mt-1">Per month average</p>
            </CardContent>
          </Card>

          <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
                Top Category
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-[#C8C0B4]" />
            </CardHeader>
            <CardContent>
              <div className="text-sm sm:text-base font-bold font-serif text-[#0A0A0A] leading-tight mt-0.5">
                {topCategory}
              </div>
              <p className="text-xs text-[#0A0A0A]/40 mt-1">
                {topCategoryPct}% of total spend
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
                Order Frequency
              </CardTitle>
              <Package className="h-4 w-4 text-[#C8C0B4]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#0A0A0A]">
                {avgWeeklyOrders}
              </div>
              <p className="text-xs text-[#0A0A0A]/40 mt-1">Orders per week avg</p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Tier */}
        {pricingTier && (
          <Card className={`border-[#C8C0B4] ${pricingTier.tier === 'VIP' ? 'bg-[#FFFBEB] border-[#B8860B]/30' : 'bg-[#F9F7F4]'}`}>
            <CardHeader className="border-b border-[#C8C0B4]/50">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-[#C8C0B4]" />
                  <CardTitle className="font-serif text-lg text-[#0A0A0A]">Your Pricing Tier</CardTitle>
                  <Badge className={`text-xs font-semibold ${tierBadgeColors[pricingTier.tier]}`}>
                    {pricingTier.tier}{pricingTier.tier === 'VIP' && ' ★'}
                  </Badge>
                </div>
                {pricingTier.tier === 'VIP' && (
                  <div className="flex items-center gap-1 text-[#B8860B] text-xs font-medium">
                    <Star className="h-3.5 w-3.5 fill-[#B8860B]" />
                    White-Glove Service
                  </div>
                )}
              </div>
              <CardDescription className="text-[#0A0A0A]/50">
                {pricingTier.tier === 'NEW' && 'Welcome! Reach $5,000 in lifetime spend to unlock Repeat Partner pricing.'}
                {pricingTier.tier === 'REPEAT' && 'Repeat Partner — reach $50,000 in lifetime spend to unlock VIP pricing.'}
                {pricingTier.tier === 'VIP' && 'VIP Partner — you have access to our best pricing across all categories.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              {pricingTier.discounts.length > 0 ? (
                <div>
                  <p className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider mb-3">Your Discounts</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {pricingTier.discounts.map((d) => (
                      <div key={d.category} className={`flex items-center justify-between px-3 py-2 border ${pricingTier.tier === 'VIP' ? 'border-[#B8860B]/30 bg-[#FEF3C7]/50' : 'border-[#C8C0B4]/40'}`}>
                        <span className="text-sm text-[#0A0A0A]/70 truncate">{d.category}</span>
                        <span className={`font-mono font-bold text-sm ml-2 shrink-0 ${pricingTier.tier === 'VIP' ? 'text-[#B8860B]' : 'text-[#0A0A0A]'}`}>
                          -{d.discountPct.toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#0A0A0A]/40 italic">No category discounts configured for your tier yet.</p>
              )}
              {pricingTier.nextTier && pricingTier.spendToNextTier !== null && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">Progress to {pricingTier.nextTier}{pricingTier.nextTier === 'VIP' && ' ★'}</p>
                    <p className="text-xs text-[#0A0A0A]/50">${pricingTier.lifetimeSpend.toLocaleString()} / ${(TIER_NEXT_THRESHOLD[pricingTier.tier] ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="h-2 bg-[#E5E1DB] overflow-hidden">
                    <div className={`h-full transition-all ${pricingTier.tier === 'NEW' ? 'bg-[#4A90D9]' : 'bg-[#B8860B]'}`} style={{ width: `${Math.min(100, (pricingTier.lifetimeSpend / (TIER_NEXT_THRESHOLD[pricingTier.tier] ?? 1)) * 100)}%` }} />
                  </div>
                  <p className="text-xs text-[#0A0A0A]/40 mt-1.5">${pricingTier.spendToNextTier.toLocaleString()} more to unlock <span className="font-medium text-[#0A0A0A]/60">{pricingTier.nextTier}</span> tier pricing</p>
                </div>
              )}
              {pricingTier.tier === 'VIP' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-[#FEF3C7] border border-[#B8860B]/30">
                  <Star className="h-4 w-4 text-[#B8860B] fill-[#B8860B] shrink-0" />
                  <p className="text-sm text-[#92400E]">You are a VIP Partner — our highest tier. Thank you for your continued partnership.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Year-over-Year + Avg Order Cycle */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div>
                <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
                  Year over Year
                </CardTitle>
                <div className="text-2xl font-bold font-serif text-[#0A0A0A] mt-1">
                  {yearOverYear && yearOverYear.change !== null ? (
                    <span
                      className={
                        yearOverYear.change >= 0
                          ? 'text-[#0A0A0A]'
                          : 'text-[#0A0A0A]/60'
                      }
                    >
                      {yearOverYear.change >= 0 ? '+' : ''}
                      {yearOverYear.change}%
                    </span>
                  ) : (
                    <span className="text-[#C8C0B4] text-lg">
                      No prior year data
                    </span>
                  )}
                </div>
              </div>
              {yearOverYear && yearOverYear.change !== null &&
                (yearOverYear.change >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-[#0A0A0A]" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-[#0A0A0A]/40" />
                ))}
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <div>
                  <p className="text-xs text-[#0A0A0A]/40">This year</p>
                  <p className="font-serif font-semibold text-[#0A0A0A]">
                    ${(yearOverYear?.thisYear ?? 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#0A0A0A]/40">Last year</p>
                  <p className="font-serif font-semibold text-[#0A0A0A]/60">
                    ${(yearOverYear?.lastYear ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div>
                <CardTitle className="text-xs font-medium text-[#0A0A0A]/50 uppercase tracking-wider">
                  Avg Order Cycle
                </CardTitle>
                <div className="text-2xl font-bold font-serif text-[#0A0A0A] mt-1">
                  {avgOrderCycleDays !== null ? (
                    <>
                      {avgOrderCycleDays}{' '}
                      <span className="text-base font-sans font-normal text-[#0A0A0A]/50">
                        days
                      </span>
                    </>
                  ) : (
                    <span className="text-[#C8C0B4] text-lg">
                      Not enough orders
                    </span>
                  )}
                </div>
              </div>
              <RefreshCcw className="h-5 w-5 text-[#C8C0B4]" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#0A0A0A]/40">
                {avgOrderCycleDays !== null
                  ? `You typically place a new order every ${avgOrderCycleDays} days`
                  : 'Place more orders to see your order cycle'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Spend Trend — upgraded to AreaChart with gradient fill */}
        <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
          <CardHeader className="border-b border-[#C8C0B4]/50">
            <CardTitle className="font-serif text-lg text-[#0A0A0A]">
              Monthly Spending Trend
            </CardTitle>
            <CardDescription className="text-[#0A0A0A]/50">
              Your total spend by month — last 12 months
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer
              config={{
                revenue: { label: 'Revenue', color: '#0A0A0A' },
              }}
              className="h-[260px] sm:h-[320px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyRevenue}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="spendGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#0A0A0A"
                        stopOpacity={0.15}
                      />
                      <stop
                        offset="95%"
                        stopColor="#0A0A0A"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#C8C0B4"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="month"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#0A0A0A', opacity: 0.5 }}
                  />
                  <YAxis
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    width={45}
                    tickFormatter={(v) => `$${v / 1000}k`}
                    tick={{ fill: '#0A0A0A', opacity: 0.5 }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value) => [
                      `$${Number(value).toLocaleString()}`,
                      'Revenue',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0A0A0A"
                    strokeWidth={2}
                    fill="url(#spendGradient)"
                    dot={{
                      r: 3,
                      fill: '#0A0A0A',
                      stroke: '#F9F7F4',
                      strokeWidth: 1.5,
                    }}
                    activeDot={{ r: 5, fill: '#0A0A0A' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Category Breakdown */}
          <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
            <CardHeader className="border-b border-[#C8C0B4]/50">
              <CardTitle className="font-serif text-lg text-[#0A0A0A]">
                Spending by Category
              </CardTitle>
              <CardDescription className="text-[#0A0A0A]/50">
                Breakdown of your total spend by product category
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ChartContainer
                config={{
                  value: { label: 'Spend' },
                }}
                className="h-[240px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={45}
                      strokeWidth={2}
                      stroke="#F9F7F4"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell
                          key={
                            (entry as { category: string }).category
                          }
                          fill={pieFills[index % pieFills.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value) => [
                        `$${Number(value).toLocaleString()}`,
                        'Spend',
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              {/* Legend */}
              <div className="grid grid-cols-1 gap-2 mt-4">
                {categoryBreakdown.map((cat, index) => (
                  <div
                    key={(cat as { category: string }).category}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    <div
                      className="h-2.5 w-2.5 shrink-0"
                      style={{ backgroundColor: pieFills[index] }}
                    />
                    <span className="text-[#0A0A0A]/60 truncate flex-1">
                      {(cat as { category: string }).category}
                    </span>
                    <span className="font-serif font-semibold text-[#0A0A0A] ml-auto shrink-0">
                      ${((cat as { value: number }).value / 1000).toFixed(0)}k
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Frequency */}
          <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
            <CardHeader className="border-b border-[#C8C0B4]/50">
              <CardTitle className="font-serif text-lg text-[#0A0A0A]">
                Order Frequency
              </CardTitle>
              <CardDescription className="text-[#0A0A0A]/50">
                Number of orders placed per week
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ChartContainer
                config={{
                  orders: { label: 'Orders', color: '#0A0A0A' },
                }}
                className="h-[240px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={orderFrequency}
                    margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#C8C0B4"
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="week"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#0A0A0A', opacity: 0.5 }}
                    />
                    <YAxis
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      width={30}
                      tick={{ fill: '#0A0A0A', opacity: 0.5 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#0A0A0A"
                      strokeWidth={2}
                      dot={{
                        r: 3,
                        fill: '#0A0A0A',
                        stroke: '#F9F7F4',
                        strokeWidth: 1.5,
                      }}
                      activeDot={{ r: 5, fill: '#0A0A0A' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Order Activity Heatmap (GitHub-style calendar) */}
        <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
          <CardHeader className="border-b border-[#C8C0B4]/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-lg text-[#0A0A0A]">
                  Order Activity
                </CardTitle>
                <CardDescription className="text-[#0A0A0A]/50">
                  Daily order activity over the last 12 months
                </CardDescription>
              </div>
              <CalendarDays className="h-5 w-5 text-[#C8C0B4]" />
            </div>
          </CardHeader>
          <CardContent className="pt-4 overflow-x-auto">
            <div
              className="inline-grid gap-[3px]"
              style={{
                gridTemplateColumns: 'repeat(52, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(7, 1fr)',
              }}
            >
              {calendarCells.map((cell, i) => (
                <div
                  key={i}
                  title={`${cell.date}: ${cell.count} order${cell.count !== 1 ? 's' : ''}`}
                  className="h-[11px] w-[11px] rounded-[2px] cursor-default"
                  style={{ backgroundColor: calendarColor(cell.count) }}
                />
              ))}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-2 mt-3 text-xs text-[#0A0A0A]/40">
              <span>Less</span>
              {[0, 1, 2, 3, 5].map((n) => (
                <div
                  key={n}
                  className="h-[10px] w-[10px] rounded-[2px]"
                  style={{ backgroundColor: calendarColor(n) }}
                />
              ))}
              <span>More</span>
            </div>
          </CardContent>
        </Card>

        {/* Top Products All-Time — horizontal bar chart */}
        <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
          <CardHeader className="border-b border-[#C8C0B4]/50">
            <CardTitle className="font-serif text-lg text-[#0A0A0A]">
              Top Products All-Time
            </CardTitle>
            <CardDescription className="text-[#0A0A0A]/50">
              Your top 10 products by total lifetime spend
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {topProductsAllTime && topProductsAllTime.length > 0 ? (
              <ChartContainer
                config={{
                  revenue: { label: 'Revenue', color: '#0A0A0A' },
                }}
                className="h-[320px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProductsAllTime}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#C8C0B4"
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      type="number"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      tick={{ fill: '#0A0A0A', opacity: 0.5 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={130}
                      tick={{ fill: '#0A0A0A', opacity: 0.7 }}
                      tickFormatter={(v: string) =>
                        v.length > 22 ? v.slice(0, 22) + '…' : v
                      }
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value) => [
                        `$${Number(value).toLocaleString()}`,
                        'Spend',
                      ]}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#0A0A0A"
                      radius={[0, 2, 2, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-sm text-[#0A0A0A]/40 py-8 text-center">
                No all-time product data yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Products Recent — ranked list */}
        <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
          <CardHeader className="border-b border-[#C8C0B4]/50">
            <CardTitle className="font-serif text-lg text-[#0A0A0A]">
              Top Products by Revenue
            </CardTitle>
            <CardDescription className="text-[#0A0A0A]/50">
              Your most purchased items ranked by spend — last 12 months
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {topProducts.map((product, idx) => {
                const maxRevenue = topProducts[0].revenue
                return (
                  <div key={product.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5">
                        <Badge
                          variant="outline"
                          className="h-6 w-6 p-0 flex items-center justify-center text-xs font-bold border-[#C8C0B4] text-[#0A0A0A]/60"
                        >
                          {idx + 1}
                        </Badge>
                        <span className="font-medium text-[#0A0A0A]">
                          {product.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className="text-xs text-[#0A0A0A]/40 hidden sm:inline">
                          {product.orders} orders
                        </span>
                        <span className="font-serif font-semibold text-[#0A0A0A]">
                          ${product.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[#C8C0B4]/20 overflow-hidden">
                      <div
                        className="h-full bg-[#0A0A0A] transition-all"
                        style={{
                          width: `${(product.revenue / maxRevenue) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
