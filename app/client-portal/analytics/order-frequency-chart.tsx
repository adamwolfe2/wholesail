'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Line,
  LineChart,
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

interface OrderFrequencyChartProps {
  orderFrequency: { week: string; orders: number }[]
}

export function OrderFrequencyChart({ orderFrequency }: OrderFrequencyChartProps) {
  return (
    <Card className="border-sand bg-cream">
      <CardHeader className="border-b border-sand/50">
        <CardTitle className="font-serif text-lg text-ink">
          Order Frequency
        </CardTitle>
        <CardDescription className="text-ink/50">
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
  )
}
