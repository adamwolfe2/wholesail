'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { PortalLayout } from '@/components/portal-nav'
import { Button } from '@/components/ui/button'
import { Loader2, Download } from 'lucide-react'
import type { AnalyticsData, PricingTierData } from './analytics-types'
import { AnalyticsKpiCards } from './analytics-kpi-cards'
import { PricingTierCard } from './pricing-tier-card'
import { SpendingChart } from './spending-chart'
import { CategoryBreakdown } from './category-breakdown'
import { OrderFrequencyChart } from './order-frequency-chart'
import { OrderActivityHeatmap } from './order-activity-heatmap'
import { TopProducts } from './top-products'

export default function AnalyticsPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [pricingTier, setPricingTier] = useState<PricingTierData | null>(null)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      setLoading(false)
      return
    }

    const controller = new AbortController()

    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/client/analytics', { signal: controller.signal })
        if (res.ok) {
          const json = await res.json()
          if (json.data && json.data.monthlyRevenue?.length > 0) {
            setAnalytics(json.data)
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return
        setFetchError(true)
      } finally {
        setLoading(false)
      }
    }

    async function fetchPricingTier() {
      try {
        const res = await fetch('/api/client/pricing-tier', { signal: controller.signal })
        if (res.ok) {
          const json = await res.json()
          setPricingTier(json)
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return
        setFetchError(true)
      }
    }

    fetchAnalytics()
    fetchPricingTier()
    return () => controller.abort()
  }, [isLoaded, isSignedIn])

  if (!isLoaded || loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-sand" />
        </div>
      </PortalLayout>
    )
  }

  if (!analytics) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          {fetchError && (
            <div className="mb-4 rounded-none border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Unable to load data. Please refresh the page or try again later.
            </div>
          )}
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              Analytics
            </h1>
            <p className="text-sm text-ink/50 mt-1">
              Insights into your spending and ordering patterns
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-xs tracking-widest uppercase text-sand mb-4">
              No data yet
            </p>
            <h2 className="font-serif text-3xl mb-4 text-ink">
              Place your first order to see analytics
            </h2>
            <p className="text-ink/50 mb-8 max-w-md">
              Once you have orders, you&apos;ll see insights on spending trends, top
              products, and order patterns.
            </p>
            <Button
              asChild
              className="bg-ink text-cream hover:bg-ink/80 rounded-none min-h-[44px]"
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

  // Month-over-month change
  let monthChange = 0
  if (monthlyRevenue.length >= 2) {
    const lastMonth = monthlyRevenue[monthlyRevenue.length - 1].revenue
    const prevMonth = monthlyRevenue[monthlyRevenue.length - 2].revenue
    monthChange =
      prevMonth > 0 ? ((lastMonth - prevMonth) / prevMonth) * 100 : 0
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        {fetchError && (
          <div className="mb-4 rounded-none border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Unable to load data. Please refresh the page or try again later.
          </div>
        )}
        {/* Page header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              Analytics
            </h1>
            <p className="text-sm text-ink/50 mt-1">
              Insights into your spending and ordering patterns
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-sand text-ink hover:bg-cream rounded-none text-xs tracking-wider uppercase h-9 px-4"
          >
            <Link href="/api/client/statement" target="_blank">
              <Download className="h-3.5 w-3.5 mr-2" />
              Account Statement
            </Link>
          </Button>
        </div>

        <AnalyticsKpiCards
          totalRevenue={kpis.totalSpent}
          avgMonthly={kpis.avgMonthly}
          topCategory={kpis.topCategory}
          topCategoryPct={kpis.topCategoryPct}
          avgWeeklyOrders={kpis.avgWeeklyOrders}
          monthChange={monthChange}
        />

        {pricingTier && <PricingTierCard pricingTier={pricingTier} />}

        <SpendingChart
          monthlyRevenue={monthlyRevenue}
          yearOverYear={yearOverYear}
          avgOrderCycleDays={avgOrderCycleDays}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryBreakdown categoryBreakdown={categoryBreakdown} />
          <OrderFrequencyChart orderFrequency={orderFrequency} />
        </div>

        <OrderActivityHeatmap orderCalendar={orderCalendar || []} />

        <TopProducts
          topProducts={topProducts}
          topProductsAllTime={topProductsAllTime}
        />
      </div>
    </PortalLayout>
  )
}
