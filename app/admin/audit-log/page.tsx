'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, History, ChevronDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AuditEvent {
  id: string
  entityType: string
  entityId: string
  action: string
  userId: string | null
  user: { name: string | null; email: string | null } | null
  metadata: Record<string, unknown> | null
  createdAt: string
}

const ACTION_COLORS: Record<string, string> = {
  created: 'bg-green-100 text-green-800',
  updated: 'bg-blue-100 text-blue-800',
  deleted: 'bg-red-100 text-red-800',
  standing_order_processed: 'bg-purple-100 text-purple-800',
  reorder_created: 'bg-yellow-100 text-yellow-800',
  order_created_via_sms: 'bg-orange-100 text-orange-800',
}

function getActionColor(action: string): string {
  for (const [key, color] of Object.entries(ACTION_COLORS)) {
    if (action.includes(key)) return color
  }
  return 'bg-gray-100 text-gray-800'
}

export default function AuditLogPage() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [entityType, setEntityType] = useState<string>('')
  const [action, setAction] = useState<string>('')
  const [filters, setFilters] = useState<{ entityTypes: string[]; actions: string[] }>({
    entityTypes: [],
    actions: [],
  })

  const fetchEvents = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true)
      setEvents([])
    } else {
      setLoadingMore(true)
    }

    try {
      const params = new URLSearchParams()
      if (!reset && cursor) params.set('cursor', cursor)
      if (entityType) params.set('entityType', entityType)
      if (action) params.set('action', action)

      const res = await fetch(`/api/admin/audit-log?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()

      if (reset) {
        setEvents(data.events)
      } else {
        setEvents((prev) => [...prev, ...data.events])
      }
      setCursor(data.nextCursor)
      if (data.filters) setFilters(data.filters)
    } catch (err) {
      console.error('Failed to load audit log:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [cursor, entityType, action])

  useEffect(() => {
    fetchEvents(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, action])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            Audit Log
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track all changes across the platform
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={entityType} onValueChange={(v) => { setEntityType(v === 'all' ? '' : v); setCursor(null) }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All entities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All entities</SelectItem>
            {filters.entityTypes.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={action} onValueChange={(v) => { setAction(v === 'all' ? '' : v); setCursor(null) }}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {filters.actions.map((a) => (
              <SelectItem key={a} value={a}>{a.replaceAll('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground self-center">
          {events.length} events loaded
        </span>
      </div>

      {/* Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No audit events found.</p>
          ) : (
            <div className="space-y-0 divide-y">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-4 py-3 first:pt-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={getActionColor(event.action)}>
                        {event.action.replaceAll('_', ' ')}
                      </Badge>
                      <Badge variant="secondary">{event.entityType}</Badge>
                      <span className="text-xs text-muted-foreground font-mono truncate">
                        {event.entityId.slice(0, 12)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{event.user?.name ?? event.user?.email ?? 'System'}</span>
                      <span>·</span>
                      <span>{formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}</span>
                    </div>
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="mt-1.5 text-xs text-muted-foreground/70 font-mono bg-muted/50 px-2 py-1 rounded max-w-xl overflow-x-auto">
                        {Object.entries(event.metadata).map(([k, v]) => (
                          <span key={k} className="mr-3">{k}: {String(v)}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {cursor && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchEvents(false)}
                disabled={loadingMore}
              >
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                Load more
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
