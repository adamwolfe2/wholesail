'use client'

import { formatCurrency } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface TopProductsProps {
  topProducts: { name: string; revenue: number; orders: number }[]
  topProductsAllTime: { name: string; revenue: number; orders: number }[]
}

export function TopProducts({ topProducts, topProductsAllTime }: TopProductsProps) {
  return (
    <>
      {/* Top Products All-Time — horizontal bar chart */}
      <Card className="border-sand bg-cream">
        <CardHeader className="border-b border-sand/50">
          <CardTitle className="font-serif text-lg text-ink">
            Top Products All-Time
          </CardTitle>
          <CardDescription className="text-ink/50">
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
                      v.length > 22 ? v.slice(0, 22) + '\u2026' : v
                    }
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value) => [
                      formatCurrency(value),
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
            <p className="text-sm text-ink/40 py-8 text-center">
              No all-time product data yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top Products Recent — ranked list */}
      <Card className="border-sand bg-cream">
        <CardHeader className="border-b border-sand/50">
          <CardTitle className="font-serif text-lg text-ink">
            Top Products by Revenue
          </CardTitle>
          <CardDescription className="text-ink/50">
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
                        className="h-6 w-6 p-0 flex items-center justify-center text-xs font-bold border-sand text-ink/60"
                      >
                        {idx + 1}
                      </Badge>
                      <span className="font-medium text-ink">
                        {product.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="text-xs text-ink/40 hidden sm:inline">
                        {product.orders} orders
                      </span>
                      <span className="font-serif font-semibold text-ink">
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-sand/20 overflow-hidden">
                    <div
                      className="h-full bg-ink transition-all"
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
    </>
  )
}
