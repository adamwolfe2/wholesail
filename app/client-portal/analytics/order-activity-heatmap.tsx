'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CalendarDays } from 'lucide-react'

function buildCalendarGrid(
  orderCalendar: { date: string; count: number }[]
): { date: string; count: number; week: number; day: number }[] {
  const calMap = new Map<string, number>()
  for (const entry of orderCalendar) {
    calMap.set(entry.date, entry.count)
  }

  const today = new Date()
  const cells: { date: string; count: number; week: number; day: number }[] = []

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

interface OrderActivityHeatmapProps {
  orderCalendar: { date: string; count: number }[]
}

export function OrderActivityHeatmap({ orderCalendar }: OrderActivityHeatmapProps) {
  const calendarCells = buildCalendarGrid(orderCalendar || [])

  return (
    <Card className="border-sand bg-cream">
      <CardHeader className="border-b border-sand/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-serif text-lg text-ink">
              Order Activity
            </CardTitle>
            <CardDescription className="text-ink/50">
              Daily order activity over the last 12 months
            </CardDescription>
          </div>
          <CalendarDays className="h-5 w-5 text-sand" />
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
        <div className="flex items-center gap-2 mt-3 text-xs text-ink/40">
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
  )
}
