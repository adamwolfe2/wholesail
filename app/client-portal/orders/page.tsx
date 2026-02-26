'use client'

export const dynamic = 'force-dynamic'

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
import { ReorderButton } from '@/components/reorder-button'

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
      return 'bg-[#0A0A0A] text-[#F9F7F4] border-[#0A0A0A]'
    case 'PENDING':
      return 'bg-transparent text-[#0A0A0A]/60 border-[#C8C0B4]'
    case 'CONFIRMED':
    case 'PROCESSING':
      return 'bg-[#C8C0B4]/30 text-[#0A0A0A] border-[#C8C0B4]'
    case 'SHIPPED':
    case 'PACKED':
      return 'bg-[#0A0A0A]/80 text-[#F9F7F4] border-[#0A0A0A]/70'
    case 'CANCELLED':
      return 'bg-transparent text-[#0A0A0A]/40 border-[#C8C0B4]/50'
    default:
      return 'bg-transparent text-[#0A0A0A]/60 border-[#C8C0B4]'
  }
}

export default function ClientOrdersPage() {
  const { isSignedIn, isLoaded } = useUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

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
        }
      } catch {
        // silently fail — empty state shows
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isLoaded, isSignedIn])

  return (
    <PortalLayout>
      <div>
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Orders</h1>
            <p className="text-sm text-[#0A0A0A]/50 mt-1">
              View and track all your orders
            </p>
          </div>
          <Button
            asChild
            className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 w-full sm:w-auto min-h-[44px]"
          >
            <Link href="/catalog">
              <ShoppingBag className="h-4 w-4 mr-2" />
              New Order
            </Link>
          </Button>
        </div>

        <Card className="border-[#C8C0B4] bg-[#F9F7F4]">
          <CardHeader className="border-b border-[#C8C0B4]/50">
            <CardTitle className="font-serif text-lg text-[#0A0A0A]">Order History</CardTitle>
            <CardDescription className="text-[#0A0A0A]/50">All orders from your account</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#C8C0B4]" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-[#C8C0B4] mx-auto mb-4" />
                <h3 className="font-serif text-lg font-medium mb-2 text-[#0A0A0A]">No orders yet</h3>
                <p className="text-[#0A0A0A]/50 text-sm mb-6">
                  Browse our catalog and place your first order.
                </p>
                <Button
                  asChild
                  className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 min-h-[44px]"
                >
                  <Link href="/catalog">Browse Catalog</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="overflow-x-auto hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#C8C0B4]/50">
                        <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Order #</TableHead>
                        <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Date</TableHead>
                        <TableHead className="text-right text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Items</TableHead>
                        <TableHead className="text-right text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Total</TableHead>
                        <TableHead className="text-[#0A0A0A]/50 uppercase tracking-wider text-xs">Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="border-[#C8C0B4]/30">
                          <TableCell className="font-mono font-medium text-[#0A0A0A]">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell className="text-[#0A0A0A]/60">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="text-right text-[#0A0A0A]/60">
                            {order.items.length}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-[#0A0A0A]">
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
                                className="text-[#0A0A0A]/60 hover:text-[#0A0A0A]"
                                asChild
                              >
                                <Link href={`/client-portal/orders/${order.orderNumber}`}>
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile card list */}
                <div className="sm:hidden space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-[#C8C0B4]/50 p-4 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-sm font-semibold text-[#0A0A0A] truncate">{order.orderNumber}</p>
                        <p className="text-xs text-[#0A0A0A]/50 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          &nbsp;&bull;&nbsp;{order.items.length} items
                        </p>
                        <div className="mt-2">
                          <Badge variant="outline" className={`text-[10px] ${getStatusColor(order.status)}`}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-[#0A0A0A]">
                          ${Number(order.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 h-8 px-2 text-[#0A0A0A]/60 hover:text-[#0A0A0A]"
                          asChild
                        >
                          <Link href={`/client-portal/orders/${order.orderNumber}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
