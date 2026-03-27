'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingBag,
  BarChart3,
} from 'lucide-react'

interface AnalyticsKpiCardsProps {
  totalRevenue: number
  avgMonthly: number
  topCategory: string
  topCategoryPct: number
  avgWeeklyOrders: string
  monthChange: number
}

export function AnalyticsKpiCards({
  totalRevenue,
  avgMonthly,
  topCategory,
  topCategoryPct,
  avgWeeklyOrders,
  monthChange,
}: AnalyticsKpiCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="border-sand bg-cream">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
            12-Month Spend
          </CardTitle>
          <DollarSign className="h-4 w-4 text-sand" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-ink">
            ${(totalRevenue / 1000).toFixed(0)}k
          </div>
          <div className="flex items-center gap-1 mt-1">
            {monthChange >= 0 ? (
              <TrendingUp className="h-3 w-3 text-ink" />
            ) : (
              <TrendingDown className="h-3 w-3 text-ink/40" />
            )}
            <span
              className={`text-xs ${monthChange >= 0 ? 'text-ink' : 'text-ink/40'}`}
            >
              {monthChange >= 0 ? '+' : ''}
              {monthChange.toFixed(1)}% vs prior month
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-sand bg-cream">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
            Avg Monthly
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-sand" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-ink">
            ${(avgMonthly / 1000).toFixed(1)}k
          </div>
          <p className="text-xs text-ink/40 mt-1">Per month average</p>
        </CardContent>
      </Card>

      <Card className="border-sand bg-cream">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
            Top Category
          </CardTitle>
          <ShoppingBag className="h-4 w-4 text-sand" />
        </CardHeader>
        <CardContent>
          <div className="text-sm sm:text-base font-bold font-serif text-ink leading-tight mt-0.5">
            {topCategory}
          </div>
          <p className="text-xs text-ink/40 mt-1">
            {topCategoryPct}% of total spend
          </p>
        </CardContent>
      </Card>

      <Card className="border-sand bg-cream">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
            Order Frequency
          </CardTitle>
          <Package className="h-4 w-4 text-sand" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-ink">
            {avgWeeklyOrders}
          </div>
          <p className="text-xs text-ink/40 mt-1">Orders per week avg</p>
        </CardContent>
      </Card>
    </div>
  )
}
