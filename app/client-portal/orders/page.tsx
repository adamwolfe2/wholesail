'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { PortalLayout } from '@/components/portal-nav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ShoppingBag, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { ReorderButton } from '@/components/reorder-button'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/animations'
import { EmptyState } from '@/components/empty-state'

interface Order {
  id: string
  orderNumber: string
  status: string
  total: string
  createdAt: string
  items: { id: string; name: string; quantity: number; unitPrice: string }[]
}

function getStatusColor(status: string) {
  switch (status.toUpperCase()) {
    case 'DELIVERED':
    case 'PAID':
      return 'bg-ink text-cream border-ink'
    case 'PENDING':
      return 'bg-transparent text-ink/60 border-sand'
    case 'CONFIRMED':
    case 'PROCESSING':
      return 'bg-sand/30 text-ink border-sand'
    case 'SHIPPED':
    case 'PACKED':
      return 'bg-ink/80 text-cream border-ink/70'
    case 'CANCELLED':
      return 'bg-transparent text-ink/40 border-sand/50'
    default:
      return 'bg-transparent text-ink/60 border-sand'
  }
}

export default function ClientOrdersPage() {
  const { isSignedIn, isLoaded } = useUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      setLoading(false)
      return
    }

    async function fetchOrders() {
      try {
        const res = await fetch('/api/client/orders')
        if (res.ok) {
          const data = await res.json()
          setOrders(data.orders || [])
          setHasMore(data.hasMore ?? false)
          setNextCursor(data.nextCursor ?? null)
        } else if (res.status >= 500) {
          setFetchError(true)
        }
      } catch {
        setFetchError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isLoaded, isSignedIn])

  async function loadMore() {
    if (loadingMore || !hasMore || !nextCursor) return
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/client/orders?cursor=${nextCursor}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(prev => [...prev, ...(data.orders || [])])
        setHasMore(data.hasMore ?? false)
        setNextCursor(data.nextCursor ?? null)
      }
    } catch {
      toast.error('Failed to load more orders')
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <PortalLayout>
      <div>
        {fetchError && (
          <div className="mb-6 flex items-center gap-3 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span className="shrink-0">&#9888;</span>
            Some order data couldn&apos;t be loaded. Please refresh in a moment or contact support if this persists.
          </div>
        )}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">Orders</h1>
            <p className="text-sm text-ink/50 mt-1">
              View and track all your orders
            </p>
          </div>
          <Button
            asChild
            className="bg-ink text-cream hover:bg-ink/80 w-full sm:w-auto min-h-[44px]"
          >
            <Link href="/catalog">
              <ShoppingBag className="h-4 w-4 mr-2" />
              New Order
            </Link>
          </Button>
        </div>

        <Card className="border-sand bg-cream">
          <CardHeader className="border-b border-sand/50">
            <CardTitle className="font-serif text-lg text-ink">Order History</CardTitle>
            <CardDescription className="text-ink/50">All orders from your account</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-sand" />
              </div>
            ) : orders.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="No orders yet"
                description="Browse our catalog and place your first order."
                action={{ label: 'Browse Catalog', href: '/catalog' }}
              />
            ) : (
              <>
                <p className="text-xs text-ink/40 mb-4">
                  Showing <span className="font-medium text-ink/70">{orders.length}</span> orders
                </p>

                {/* Desktop table */}
                <div className="overflow-x-auto hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-sand/50">
                        <TableHead className="text-ink/50 uppercase tracking-wider text-xs">Order #</TableHead>
                        <TableHead className="text-ink/50 uppercase tracking-wider text-xs">Date</TableHead>
                        <TableHead className="text-right text-ink/50 uppercase tracking-wider text-xs">Items</TableHead>
                        <TableHead className="text-right text-ink/50 uppercase tracking-wider text-xs">Total</TableHead>
                        <TableHead className="text-ink/50 uppercase tracking-wider text-xs">Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order, i) => (
                        <motion.tr
                          key={order.id}
                          className="border-b border-sand/30"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                          <TableCell className="font-mono font-medium text-ink">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell className="text-ink/60">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="text-right text-ink/60">
                            {order.items.length}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-ink">
                            ${Number(order.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 justify-end">
                              <ReorderButton orderNumber={order.orderNumber} />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-ink/60 hover:text-ink"
                                asChild
                              >
                                <Link href={`/client-portal/orders/${order.orderNumber}`}>
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="border-sand text-ink hover:bg-sand/20 min-h-[44px] min-w-[140px]"
                    >
                      {loadingMore ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Load More Orders'
                      )}
                    </Button>
                  </div>
                )}

                {/* Mobile card list */}
                <motion.div
                  className="sm:hidden space-y-3"
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                >
                  {orders.map((order) => (
                    <motion.div
                      key={order.id}
                      variants={fadeUp}
                      className="border border-sand/50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-sm font-semibold text-ink truncate">{order.orderNumber}</p>
                          <p className="text-xs text-ink/50 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            &nbsp;&bull;&nbsp;{order.items.length} items
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-ink">
                            ${Number(order.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <Badge variant="outline" className={`text-[10px] mt-1 ${getStatusColor(order.status)}`}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                      {/* Mobile action row */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-sand/30">
                        <ReorderButton orderNumber={order.orderNumber} size="sm" variant="outline" />
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-sand text-ink hover:bg-sand/20 min-h-[44px]"
                          asChild
                        >
                          <Link href={`/client-portal/orders/${order.orderNumber}`}>
                            View Details
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
