'use client'

import { formatCurrency } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
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
  RefreshCcw,
} from 'lucide-react'

interface SpendingChartProps {
  monthlyRevenue: { month: string; revenue: number }[]
  yearOverYear: { thisYear: number; lastYear: number; change: number | null } | undefined
  avgOrderCycleDays: number | null
}

export function SpendingChart({
  monthlyRevenue,
  yearOverYear,
  avgOrderCycleDays,
}: SpendingChartProps) {
  return (
    <>
      {/* Year-over-Year + Avg Order Cycle */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card className="border-sand bg-cream">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div>
              <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                Year over Year
              </CardTitle>
              <div className="text-2xl font-bold font-serif text-ink mt-1">
                {yearOverYear && yearOverYear.change !== null ? (
                  <span
                    className={
                      yearOverYear.change >= 0
                        ? 'text-ink'
                        : 'text-ink/60'
                    }
                  >
                    {yearOverYear.change >= 0 ? '+' : ''}
                    {yearOverYear.change}%
                  </span>
                ) : (
                  <span className="text-sand text-lg">
                    No prior year data
                  </span>
                )}
              </div>
            </div>
            {yearOverYear && yearOverYear.change !== null &&
              (yearOverYear.change >= 0 ? (
                <TrendingUp className="h-5 w-5 text-ink" />
              ) : (
                <TrendingDown className="h-5 w-5 text-ink/40" />
              ))}
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm">
              <div>
                <p className="text-xs text-ink/40">This year</p>
                <p className="font-serif font-semibold text-ink">
                  {formatCurrency(yearOverYear?.thisYear ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink/40">Last year</p>
                <p className="font-serif font-semibold text-ink/60">
                  {formatCurrency(yearOverYear?.lastYear ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-sand bg-cream">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div>
              <CardTitle className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                Avg Order Cycle
              </CardTitle>
              <div className="text-2xl font-bold font-serif text-ink mt-1">
                {avgOrderCycleDays !== null ? (
                  <>
                    {avgOrderCycleDays}{' '}
                    <span className="text-base font-sans font-normal text-ink/50">
                      days
                    </span>
                  </>
                ) : (
                  <span className="text-sand text-lg">
                    Not enough orders
                  </span>
                )}
              </div>
            </div>
            <RefreshCcw className="h-5 w-5 text-sand" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-ink/40">
              {avgOrderCycleDays !== null
                ? `You typically place a new order every ${avgOrderCycleDays} days`
                : 'Place more orders to see your order cycle'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Spend Trend — AreaChart with gradient fill */}
      <Card className="border-sand bg-cream">
        <CardHeader className="border-b border-sand/50">
          <CardTitle className="font-serif text-lg text-ink">
            Monthly Spending Trend
          </CardTitle>
          <CardDescription className="text-ink/50">
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
                    formatCurrency(value),
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
    </>
  )
}
