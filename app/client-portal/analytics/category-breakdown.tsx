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
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const pieFills = ['#0A0A0A', '#3D3530', '#6B5E58', '#C8C0B4', '#E8E4DF']

interface CategoryBreakdownProps {
  categoryBreakdown: { category: string; value: number }[]
}

export function CategoryBreakdown({ categoryBreakdown }: CategoryBreakdownProps) {
  return (
    <Card className="border-sand bg-cream">
      <CardHeader className="border-b border-sand/50">
        <CardTitle className="font-serif text-lg text-ink">
          Spending by Category
        </CardTitle>
        <CardDescription className="text-ink/50">
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
                    key={(entry as { category: string }).category}
                    fill={pieFills[index % pieFills.length]}
                  />
                ))}
              </Pie>
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [
                  formatCurrency(value),
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
              <span className="text-ink/60 truncate flex-1">
                {(cat as { category: string }).category}
              </span>
              <span className="font-serif font-semibold text-ink ml-auto shrink-0">
                ${((cat as { value: number }).value / 1000).toFixed(0)}k
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
