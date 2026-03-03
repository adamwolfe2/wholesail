'use client'

import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface RevenueSparklineProps {
  data: Array<{ date: string; revenue: number }>
}

interface TooltipPayloadEntry {
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="border border-[#E5E1DB] bg-[#F9F7F4] px-2 py-1 text-xs text-[#0A0A0A]">
      <p className="text-[#C8C0B4]">{label}</p>
      <p className="font-mono font-bold">
        ${payload[0].value.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </p>
    </div>
  )
}

export function RevenueSparkline({ data }: RevenueSparklineProps) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0A0A0A" stopOpacity={0.08} />
            <stop offset="95%" stopColor="#0A0A0A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: '#C8C0B4', fontFamily: 'inherit' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#0A0A0A"
          strokeWidth={1.5}
          fill="url(#revenueGradient)"
          dot={false}
          activeDot={{ r: 3, fill: '#0A0A0A', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
