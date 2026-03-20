'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface OrderData {
  id: string
  orderNumber: string
  status: string
  subtotal: string
  tax: string
  deliveryFee: string
  total: string
  notes: string | null
  createdAt: string
  organization: {
    name: string
    email: string
    phone: string
    contactPerson: string
  } | null
  user: {
    name: string
    email: string
  } | null
  items: {
    id: string
    name: string
    quantity: number
    unitPrice: string
    total: string
    product: { unit: string } | null
  }[]
}

import { orderStatusColors as statusColors } from '@/lib/status-colors'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const { isSignedIn, isLoaded } = useUser()
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const orderNumber = searchParams.get('order')

  useEffect(() => {
    if (!orderNumber || !isLoaded) {
      if (isLoaded) setLoading(false)
      return
    }

    async function fetchOrder() {
      // Retry up to 3 times with 1.5s delay — the Stripe webhook may not have
      // processed yet when Stripe redirects here immediately after payment.
      const MAX_ATTEMPTS = 3
      const DELAY_MS = 1500
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          const res = await fetch(`/api/client/orders/${orderNumber}`)
          if (res.ok) {
            const data = await res.json()
            setOrderData(data.order)
            setLoading(false)
            return
          }
          // If not found and we have retries left, wait before trying again
          if (res.status === 404 && attempt < MAX_ATTEMPTS) {
            await new Promise(resolve => setTimeout(resolve, DELAY_MS))
            continue
          }
          setError(true)
        } catch {
          if (attempt < MAX_ATTEMPTS) {
            await new Promise(resolve => setTimeout(resolve, DELAY_MS))
            continue
          }
          setError(true)
        }
      }
      setLoading(false)
    }

    if (isSignedIn) {
      fetchOrder()
    } else {
      setLoading(false)
    }
  }, [orderNumber, isSignedIn, isLoaded])

  if (loading) {
    return (
      <div className="container mx-auto px-3 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!orderNumber || error || !orderData) {
    return (
      <div className="container mx-auto px-3 py-20 text-center max-w-2xl">
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-6">
          {orderNumber ? 'Order Placed' : 'No Order Found'}
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl mb-6 leading-tight">
          {orderNumber ? 'Thank you.' : 'Order not found.'}
        </h1>
        {orderNumber && (
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Order <span className="font-mono font-medium">{orderNumber}</span> has been placed.
            {!isSignedIn && ' Sign in to view your full order details.'}
          </p>
        )}
        <div className="flex justify-center gap-3">
          <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/80 rounded-none">
            <Link href="/">Return Home</Link>
          </Button>
          {orderNumber && (
            <Button variant="outline" asChild size="lg" className="rounded-none border-border">
              <Link href="/client-portal/orders">My Orders</Link>
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 py-10 sm:px-6 sm:py-14 lg:px-8 max-w-3xl">
      {/* Hero */}
      <div className="mb-10 sm:mb-12">
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">Confirmation</p>
        <h1 className="font-serif text-4xl sm:text-5xl leading-tight mb-4">Order Confirmed.</h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
          We&apos;ll review your order and contact you shortly to confirm pricing and delivery details.
          Expect to hear from us within 24 hours.
        </p>
      </div>

      <Card className="border-border mb-6">
        <CardHeader className="border-b border-border pb-5">
          <CardTitle className="font-serif text-xl sm:text-2xl font-normal">Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-4 sm:px-6 pt-5">
          <div className="grid gap-3 text-sm">
            <div className="grid grid-cols-3">
              <span className="text-xs tracking-widest uppercase text-muted-foreground">Order #</span>
              <span className="col-span-2 font-mono font-medium">{orderData.orderNumber}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-xs tracking-widest uppercase text-muted-foreground">Status</span>
              <span className="col-span-2">
                <Badge variant="outline" className={statusColors[orderData.status] || ''}>
                  {orderData.status}
                </Badge>
              </span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-xs tracking-widest uppercase text-muted-foreground">Date</span>
              <span className="col-span-2">
                {new Date(orderData.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {orderData.organization && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-xs tracking-widest uppercase text-muted-foreground">Contact Information</h3>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Business: </span>
                    {orderData.organization.name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contact: </span>
                    {orderData.organization.contactPerson}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    {orderData.organization.email}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone: </span>
                    {orderData.organization.phone}
                  </div>
                </div>
              </div>
            </>
          )}

          {orderData.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-xs tracking-widest uppercase text-muted-foreground">Order Notes</h3>
                <p className="text-sm whitespace-pre-line">{orderData.notes}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-4">
            <h3 className="text-xs tracking-widest uppercase text-muted-foreground">Order Items</h3>
            {orderData.items.map(item => (
              <div key={item.id} className="flex justify-between gap-4 text-sm pb-3 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm mb-1 text-pretty">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity} &times; {formatCurrency(item.unitPrice)}
                    {item.product?.unit ? ` ${item.product.unit}` : ''}
                  </p>
                </div>
                <p className="font-semibold text-sm shrink-0">{formatCurrency(item.total)}</p>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(orderData.subtotal)}</span>
            </div>
            {Number(orderData.tax) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(orderData.tax)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span>{Number(orderData.deliveryFee) > 0 ? formatCurrency(orderData.deliveryFee) : 'FREE'}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center pt-2">
              <span className="font-serif text-xl">Total</span>
              <span className="font-serif text-2xl">{formatCurrency(orderData.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What happens next */}
      <div className="border border-border bg-muted/30 p-5 sm:p-6 mb-8">
        <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-4">What Happens Next</h3>
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>Our team will review your order within 24 hours</li>
          <li>We&apos;ll contact you to confirm final pricing and availability</li>
          <li>Typical delivery time is 24–48 hours after confirmation</li>
          <li>You&apos;ll receive tracking information once your order ships</li>
        </ul>
      </div>

      <div className="flex justify-center gap-3">
        <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/80 rounded-none h-11 sm:h-12">
          <Link href="/">Return to Products</Link>
        </Button>
        <Button variant="outline" asChild size="lg" className="rounded-none border-border h-11 sm:h-12">
          <Link href="/client-portal/orders">My Orders</Link>
        </Button>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 sm:h-16 items-center px-3 sm:px-6 lg:px-8">
          <Link href="/" className="font-serif text-xl tracking-tight">
            {process.env.NEXT_PUBLIC_BRAND_NAME || "Wholesail"}
          </Link>
        </div>
      </header>
      <Suspense
        fallback={
          <div className="container mx-auto px-3 py-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <ConfirmationContent />
      </Suspense>
    </div>
  )
}
