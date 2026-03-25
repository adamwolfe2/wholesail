'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Bell } from 'lucide-react'
import Link from 'next/link'

interface OverdueReorder {
  orgId: string
  orgName: string
  avgCadenceDays: number
  daysSinceLastOrder: number
  overdueDays: number
  lastOrderDate: string
  topProducts: string[]
}

export function SmartReorderAlerts() {
  const [results, setResults] = useState<OverdueReorder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/admin/smart-reorder')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => setResults(data.results ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card className="border-shell">
      <CardHeader className="border-b border-shell pb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-amber-600" />
          <CardTitle className="font-serif text-xl font-normal text-ink">
            Smart Reorder Alerts
          </CardTitle>
          {!loading && results.length > 0 && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-medium">
              {results.length} overdue
            </Badge>
          )}
        </div>
        <CardDescription className="text-sand text-xs mt-1">
          Clients who are overdue based on their historical order cadence
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-sand" />
          </div>
        ) : error ? (
          <p className="text-sm text-sand text-center py-10">
            Failed to load reorder alerts
          </p>
        ) : results.length === 0 ? (
          <p className="text-sm text-sand text-center py-10">
            All clients are within their reorder windows
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-shell bg-cream">
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-sand font-medium">
                    Organization
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-sand font-medium">
                    Avg Cadence
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-sand font-medium">
                    Days Overdue
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-sand font-medium hidden sm:table-cell">
                    Top Products
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-sand font-medium">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const urgency =
                    r.overdueDays > r.avgCadenceDays
                      ? 'high'
                      : r.overdueDays > r.avgCadenceDays * 0.5
                      ? 'medium'
                      : 'low'

                  return (
                    <tr
                      key={r.orgId}
                      className="border-b border-shell last:border-b-0 hover:bg-cream/60 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-ink">{r.orgName}</span>
                        <span className="block text-[10px] text-sand mt-0.5">
                          Last order {r.daysSinceLastOrder}d ago
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/70">
                        {r.avgCadenceDays}d
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            urgency === 'high'
                              ? 'inline-block px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 border border-red-200'
                              : urgency === 'medium'
                              ? 'inline-block px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200'
                              : 'inline-block px-2 py-0.5 text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200'
                          }
                        >
                          +{r.overdueDays}d
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {r.topProducts.length > 0 ? (
                          <span className="text-ink/60 text-xs">
                            {r.topProducts.slice(0, 3).join(', ')}
                          </span>
                        ) : (
                          <span className="text-sand text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href="/admin/messages"
                          className="text-xs text-ink underline underline-offset-2 hover:text-ink/60 transition-colors"
                        >
                          Message
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
