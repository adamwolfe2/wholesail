export interface AnalyticsData {
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

export interface PricingTierData {
  tier: 'NEW' | 'REPEAT' | 'VIP'
  lifetimeSpend: number
  discounts: { category: string; discountPct: number }[]
  nextTier: 'REPEAT' | 'VIP' | null
  spendToNextTier: number | null
}

export const TIER_NEXT_THRESHOLD: Record<string, number> = {
  NEW: 5000,
  REPEAT: 50000,
}

export const tierBadgeColors: Record<string, string> = {
  NEW: 'bg-shell text-ink border-0',
  REPEAT: 'bg-sky/20 text-brand border-0',
  VIP: 'bg-gold-light text-gold border-0',
}
