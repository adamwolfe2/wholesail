'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { portalConfig } from '@/lib/portal-config'
import { formatCurrency } from '@/lib/utils'
import { Loader2, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

const slideInRight = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

interface CreditStatus {
  limit: number | null
  used: number
  available: number | null
  utilizationPct: number | null
  isAtLimit: boolean
  isNearLimit: boolean
  referralCredits: number
  loyaltyPoints: number
  loyaltyDollarValue: number
}

interface SavedAddress {
  id: string
  street: string
  city: string
  state: string
  zip: string
  type: 'BILLING' | 'SHIPPING'
  isDefault: boolean
}

const REQUIRED_FIELDS = ['businessName', 'contactName', 'email', 'phone', 'deliveryAddress', 'city', 'state', 'zip'] as const

function validateField(name: string, value: string): string {
  const v = value.trim()
  switch (name) {
    case 'businessName':
    case 'contactName':
      return v.length < 2 ? 'Required' : ''
    case 'email':
      return !v ? 'Required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email' : ''
    case 'phone':
      return !v ? 'Required' : v.replace(/\D/g, '').length < 10 ? 'Enter a valid phone number' : ''
    case 'deliveryAddress':
      return v.length < 5 ? 'Required' : ''
    case 'city':
      return v.length < 2 ? 'Required' : ''
    case 'state':
      return !v ? 'Required' : !/^[A-Za-z]{2}$/.test(v) ? 'Enter 2-letter state code' : ''
    case 'zip':
      return !v ? 'Required' : !/^\d{5}(-\d{4})?$/.test(v) ? 'Enter a valid ZIP code' : ''
    default:
      return ''
  }
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { items, getTotalPrice, clearCart } = useCart()
  const { user, isSignedIn } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(
    searchParams.get('cancelled') === 'true' ? 'Payment was cancelled. You can try again when ready.' : null
  )
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: user?.fullName || '',
    email: user?.emailAddresses?.[0]?.emailAddress || '',
    phone: '',
    deliveryAddress: '',
    city: '',
    state: '',
    zip: '',
    notes: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null)
  const [useCredits, setUseCredits] = useState(false)
  const [useLoyalty, setUseLoyalty] = useState(false)

  useEffect(() => {
    if (!isSignedIn) return
    const controller = new AbortController()

    fetch('/api/client/addresses', { signal: controller.signal })
      .then(r => r.json())
      .then(data => setSavedAddresses(data.addresses ?? []))
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return
      })

    fetch('/api/client/credit', { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && (data.limit !== null || data.used > 0)) {
          setCreditStatus(data)
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return
      })

    return () => controller.abort()
  }, [isSignedIn])

  const subtotal = getTotalPrice()
  const deliveryFee = subtotal >= 500 ? 0 : 25
  const referralCredits = creditStatus?.referralCredits ?? 0
  const creditDiscount = useCredits && referralCredits > 0
    ? Math.min(referralCredits, subtotal + deliveryFee)
    : 0
  const loyaltyDollarValue = creditStatus?.loyaltyDollarValue ?? 0
  const loyaltyDiscount = useLoyalty && loyaltyDollarValue > 0
    ? Math.min(loyaltyDollarValue, subtotal + deliveryFee - creditDiscount)
    : 0
  const totalPrice = subtotal + deliveryFee - creditDiscount - loyaltyDiscount

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-14 sm:h-16 items-center px-3 sm:px-6 lg:px-8">
            <Link href="/" className="font-serif text-xl tracking-tight">
              {portalConfig.brandName}
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-3 py-20 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl mb-6">Your cart is empty.</h1>
          <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/80 rounded-none">
            <Link href="/">Back to Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate all required fields before submitting
    const newErrors: Record<string, string> = {}
    const allTouched: Record<string, boolean> = {}
    for (const field of REQUIRED_FIELDS) {
      allTouched[field] = true
      newErrors[field] = validateField(field, formData[field as keyof typeof formData] as string)
    }
    setTouched(allTouched)
    setFieldErrors(newErrors)
    if (Object.values(newErrors).some(Boolean)) return

    setIsSubmitting(true)

    try {
      if (!isSignedIn) {
        router.push('/sign-in?redirect_url=/checkout')
        return
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
          ...formData,
          applyCredits: useCredits && creditDiscount > 0,
          redeemPoints: useLoyalty && loyaltyDiscount > 0
            ? (creditStatus?.loyaltyPoints ?? 0)
            : 0,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 402 && data.code === 'CREDIT_LIMIT_EXCEEDED') {
          setError('Your credit limit has been reached. Please pay outstanding invoices or contact your account manager.')
        } else {
          setError(data.error || 'Failed to create order')
        }
        setIsSubmitting(false)
        return
      }

      if (data.checkoutUrl) {
        clearCart()
        window.location.href = data.checkoutUrl
        return
      }

      localStorage.setItem('lastOrder', JSON.stringify({
        orderId: data.orderNumber,
        ...formData,
        items,
        totalPrice,
        orderDate: new Date().toISOString(),
      }))
      clearCart()
      router.push(`/confirmation?order=${data.orderNumber}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (touched[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 sm:h-16 items-center px-3 sm:px-6 lg:px-8">
          <Link href="/" className="font-serif text-xl tracking-tight">
            {portalConfig.brandName}
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-6xl">
        <Link
          href="/"
          className="inline-block text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          Back to Products
        </Link>

        <h1 className="font-serif text-3xl sm:text-4xl tracking-tight mb-8">Checkout</h1>

        {!isSignedIn && (
          <div className="mb-6 border border-border bg-muted/40 p-4">
            <p className="text-sm font-medium mb-1">Sign in to complete your order</p>
            <p className="text-sm text-muted-foreground">
              <Link href="/sign-in?redirect_url=/checkout" className="underline underline-offset-2">Sign in</Link>
              {' '}or{' '}
              <Link href="/sign-up" className="underline underline-offset-2">create an account</Link>
              {' '}to place your order. You can fill out the form below in the meantime.
            </p>
          </div>
        )}

        {/* Credit status warning banner */}
        {creditStatus?.isAtLimit && (
          <div className="mb-6 border border-red-300 bg-red-50 p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Credit limit reached</p>
              <p className="text-sm text-red-700 mt-0.5">
                You cannot place new orders until outstanding invoices are paid.{' '}
                <Link href="/client-portal/invoices" className="underline underline-offset-2">View invoices</Link>
                {' '}or contact your account manager.
              </p>
            </div>
          </div>
        )}
        {creditStatus?.isNearLimit && !creditStatus.isAtLimit && (
          <div className="mb-6 border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Approaching credit limit</p>
              <p className="text-sm text-amber-700 mt-0.5">
                You have ${(creditStatus.available ?? 0).toLocaleString()} of ${(creditStatus.limit ?? 0).toLocaleString()} remaining.{' '}
                <Link href="/client-portal/invoices" className="underline underline-offset-2">Pay outstanding invoices</Link>
                {' '}to restore your full limit.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Order Form */}
          <div className="lg:col-span-2 order-last lg:order-first">
            <Card className="border-border">
              <CardHeader className="border-b border-border pb-5">
                <CardTitle className="font-serif text-2xl sm:text-3xl font-normal">Order Information</CardTitle>
                <CardDescription className="text-sm">Please provide your contact and delivery details</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 px-4 sm:px-6">
                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-5 sm:space-y-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Restaurant or Business Name"
                        className={`rounded-none bg-background ${fieldErrors.businessName ? 'border-destructive' : 'border-border'}`}
                      />
                      {fieldErrors.businessName && <p className="text-xs text-destructive">{fieldErrors.businessName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name *</Label>
                      <Input
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Your Name"
                        className={`rounded-none bg-background ${fieldErrors.contactName ? 'border-destructive' : 'border-border'}`}
                      />
                      {fieldErrors.contactName && <p className="text-xs text-destructive">{fieldErrors.contactName}</p>}
                    </div>
                  </motion.div>
                  <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="your@email.com"
                        className={`rounded-none bg-background ${fieldErrors.email ? 'border-destructive' : 'border-border'}`}
                      />
                      {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="(555) 123-4567"
                        className={`rounded-none bg-background ${fieldErrors.phone ? 'border-destructive' : 'border-border'}`}
                      />
                      {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
                    </div>
                  </motion.div>

                  {savedAddresses.length > 0 && (
                    <div className="mb-2">
                      <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-3">
                        Saved Addresses
                      </label>
                      <div className="space-y-2">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setSelectedAddressId(addr.id)
                              setFormData(prev => ({
                                ...prev,
                                deliveryAddress: addr.street,
                                city: addr.city,
                                state: addr.state,
                                zip: addr.zip,
                              }))
                            }}
                            className={`w-full text-left border px-4 py-3 text-sm transition-colors ${
                              selectedAddressId === addr.id
                                ? 'border-foreground bg-muted/40'
                                : 'border-border hover:border-foreground/40'
                            }`}
                          >
                            <span className="font-medium">{addr.street}</span>
                            <span className="text-muted-foreground ml-2">
                              {addr.city}, {addr.state} {addr.zip}
                            </span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAddressId(null)
                            setFormData(prev => ({
                              ...prev,
                              deliveryAddress: '',
                              city: '',
                              state: '',
                              zip: '',
                            }))
                          }}
                          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                        >
                          Enter a different address
                        </button>
                      </div>
                    </div>
                  )}

                  <motion.div variants={fadeUp} className="space-y-2">
                    <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                    <Input
                      id="deliveryAddress"
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Street address"
                      className={`rounded-none bg-background ${fieldErrors.deliveryAddress ? 'border-destructive' : 'border-border'}`}
                    />
                    {fieldErrors.deliveryAddress && <p className="text-xs text-destructive">{fieldErrors.deliveryAddress}</p>}
                  </motion.div>

                  <motion.div variants={fadeUp} className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Los Angeles"
                        className={`rounded-none bg-background ${fieldErrors.city ? 'border-destructive' : 'border-border'}`}
                      />
                      {fieldErrors.city && <p className="text-xs text-destructive">{fieldErrors.city}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="CA"
                        maxLength={2}
                        className={`rounded-none bg-background ${fieldErrors.state ? 'border-destructive' : 'border-border'}`}
                      />
                      {fieldErrors.state && <p className="text-xs text-destructive">{fieldErrors.state}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP *</Label>
                      <Input
                        id="zip"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="90015"
                        maxLength={10}
                        className={`rounded-none bg-background ${fieldErrors.zip ? 'border-destructive' : 'border-border'}`}
                      />
                      {fieldErrors.zip && <p className="text-xs text-destructive">{fieldErrors.zip}</p>}
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUp} className="space-y-2">
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Special instructions, preferred delivery time, etc."
                      rows={3}
                      maxLength={500}
                      className="rounded-none border-border bg-background"
                    />
                  </motion.div>

                  {error && (
                    <p role="alert" className="text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">
                      {error}
                    </p>
                  )}

                  <motion.div variants={fadeUp}>
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-foreground text-background hover:bg-foreground/80 rounded-none"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Proceed to Payment'
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <motion.div
            className="lg:col-span-1 order-first lg:order-last"
            variants={slideInRight}
            initial="hidden"
            animate="visible"
          >
            <Card className="border-border lg:sticky lg:top-24">
              <CardHeader className="border-b border-border pb-5">
                <CardTitle className="font-serif text-xl sm:text-2xl font-normal">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6 pt-5">
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between gap-4 text-sm pb-4 border-b border-border last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm mb-1 text-pretty">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} &times; {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="font-semibold text-sm shrink-0">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className={deliveryFee === 0 ? 'text-foreground font-medium' : ''}>
                      {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
                    </span>
                  </div>
                  {deliveryFee > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Free delivery on orders $500+
                    </p>
                  )}
                  {referralCredits > 0 && (
                    <button
                      type="button"
                      onClick={() => setUseCredits(v => !v)}
                      className={`w-full flex justify-between items-center text-sm border px-3 py-2 transition-colors ${
                        useCredits
                          ? 'border-foreground bg-muted/30'
                          : 'border-border hover:border-foreground/30'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`inline-flex items-center justify-center w-4 h-4 border text-[10px] leading-none shrink-0 ${
                          useCredits ? 'bg-foreground border-foreground text-background' : 'border-input'
                        }`}>
                          {useCredits ? '✓' : ''}
                        </span>
                        <span>Referral credit</span>
                      </span>
                      <span className={useCredits ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        {useCredits ? `-${formatCurrency(creditDiscount)}` : `${formatCurrency(referralCredits)} available`}
                      </span>
                    </button>
                  )}
                  {loyaltyDollarValue > 0 && (
                    <button
                      type="button"
                      onClick={() => setUseLoyalty(v => !v)}
                      className={`w-full flex justify-between items-center text-sm border px-3 py-2 transition-colors ${
                        useLoyalty
                          ? 'border-foreground bg-muted/30'
                          : 'border-border hover:border-foreground/30'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`inline-flex items-center justify-center w-4 h-4 border text-[10px] leading-none shrink-0 ${
                          useLoyalty ? 'bg-foreground border-foreground text-background' : 'border-input'
                        }`}>
                          {useLoyalty ? '✓' : ''}
                        </span>
                        <span>Loyalty points <span className="text-muted-foreground">({creditStatus?.loyaltyPoints ?? 0} pts)</span></span>
                      </span>
                      <span className={useLoyalty ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        {useLoyalty ? `-${formatCurrency(loyaltyDiscount)}` : `${formatCurrency(loyaltyDollarValue)} available`}
                      </span>
                    </button>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-serif text-lg">Total</span>
                    <span className="font-serif text-2xl">{formatCurrency(totalPrice)}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground border-t border-border pt-3">
                    You&apos;ll be redirected to Stripe for secure payment.
                    Prices subject to change for market-rate items.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-label="Loading checkout">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
