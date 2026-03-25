'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Sparkles } from 'lucide-react'

const BUSINESS_TYPES = [
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'HOTEL', label: 'Hotel / Resort' },
  { value: 'CATERING', label: 'Catering Company' },
  { value: 'RETAIL', label: 'Retail / Specialty Store' },
  { value: 'DISTRIBUTOR', label: 'Distributor' },
  { value: 'OTHER', label: 'Other' },
]

const PRODUCT_INTERESTS = [
  'Fresh Truffles',
  'Caviar',
  'Truffle Butters & Oils',
  'Salumi',
  'Seasonings & Preserved Products',
  'Accessories',
]

const VOLUME_OPTIONS = [
  'Under $1,000/month',
  '$1,000 - $5,000/month',
  '$5,000 - $15,000/month',
  '$15,000 - $50,000/month',
  '$50,000+/month',
]

function PartnerOnboardingContent() {
  const searchParams = useSearchParams()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enriching, setEnriching] = useState(false)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    businessType: '',
    estimatedMonthlyVolume: '',
    currentSupplier: '',
    productsInterested: [] as string[],
    deliveryAddress: '',
    city: '',
    state: '',
    zip: '',
    howDidYouHear: '',
    notes: '',
  })

  // Capture referral code from ?ref= param and persist in localStorage
  useEffect(() => {
    const refParam = searchParams.get('ref')
    if (refParam) {
      setReferralCode(refParam.toUpperCase())
      try {
        localStorage.setItem('wholesail_referral_code', refParam.toUpperCase())
      } catch {
        // localStorage not available
      }
    } else {
      // Check localStorage for previously stored code
      try {
        const stored = localStorage.getItem('wholesail_referral_code')
        if (stored) setReferralCode(stored)
      } catch {
        // localStorage not available
      }
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function enrichWebsite() {
    if (!formData.website) return
    let url = formData.website
    if (!url.startsWith('http')) url = `https://${url}`

    setEnriching(true)
    try {
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (res.ok) {
        const data = await res.json()
        setFormData(prev => ({
          ...prev,
          businessName: prev.businessName || data.companyName || '',
          email: prev.email || data.email || '',
          phone: prev.phone || data.phone || '',
          website: url,
        }))
        if (data.logo) {
          setCompanyLogo(data.logo)
        }
      }
    } catch {
      // Enrichment failed silently — user can still fill manually
    } finally {
      setEnriching(false)
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleProductToggle = (product: string) => {
    setFormData(prev => ({
      ...prev,
      productsInterested: prev.productsInterested.includes(product)
        ? prev.productsInterested.filter(p => p !== product)
        : [...prev.productsInterested, product],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, referralCode: referralCode || undefined }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }

      setSubmitted(true)
    } catch {
      setError('Network error. Please check your connection and try again.')
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-14 sm:h-16 items-center px-3 sm:px-6 lg:px-8">
            <Link href="/" className="shrink-0">
              <Image
                src="/wholesail-logo.svg"
                alt="Wholesail"
                width={110}
                height={84}
                className="h-8 sm:h-9 w-auto"
              />
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-3 py-20 sm:px-6 lg:px-8 max-w-2xl text-center">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-6">Application Received</p>
          <h1 className="font-serif text-4xl sm:text-5xl mb-6 leading-tight">
            You&apos;re in the queue.
          </h1>
          <p className="text-muted-foreground mb-3 leading-relaxed">
            Thank you for applying to partner with Wholesail.
          </p>
          <p className="text-muted-foreground mb-3 leading-relaxed">
            Our team will review your application and reach out within 24 hours to confirm
            your account, discuss pricing, and set up delivery logistics.
          </p>
          <p className="text-muted-foreground mb-10 leading-relaxed text-sm">
            While you wait, you can browse the catalog or create your client portal account
            — it&apos;ll be ready to use as soon as we activate your wholesale access.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild size="lg" className="bg-ink text-cream hover:bg-ink-dark">
              <Link href="/catalog">Browse the Catalog</Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="border-border">
              <Link href="/sign-up">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 sm:h-16 items-center px-3 sm:px-6 lg:px-8">
          <Link href="/" className="font-serif text-xl tracking-tight">
            Wholesail
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-3 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-4xl">
        <Link
          href="/"
          className="inline-block text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          Back to Marketplace
        </Link>

        {/* Hero */}
        <div className="mb-10">
          <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">Wholesale Partnership</p>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight mb-4 leading-tight">
            Apply for Wholesale Access
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            Join 342+ restaurants, hotels, and culinary professionals who source truffles, caviar, and
            specialty foods through Wholesail. Tell us about your establishment and our team will activate
            your account within 24 hours.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4 mb-10 border border-border bg-border">
          <div className="bg-background p-5">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Pricing</p>
            <p className="font-medium text-sm">True Wholesale Rates</p>
            <p className="text-xs text-muted-foreground mt-1">Direct-source pricing — no middleman markup</p>
          </div>
          <div className="bg-background p-5">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Delivery</p>
            <p className="font-medium text-sm">Same-Week Guaranteed</p>
            <p className="text-xs text-muted-foreground mt-1">SoCal next-day · Nationwide 24–48hr cold chain</p>
          </div>
          <div className="bg-background p-5">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Payment</p>
            <p className="font-medium text-sm">Net 30 Terms</p>
            <p className="text-xs text-muted-foreground mt-1">Flexible invoicing for qualified accounts</p>
          </div>
          <div className="bg-background p-5">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">Support</p>
            <p className="font-medium text-sm">Dedicated Account Rep</p>
            <p className="text-xs text-muted-foreground mt-1">A real person. Same contact every time.</p>
          </div>
        </div>

        {/* Application Form */}
        <Card className="border-border">
          <CardHeader className="border-b border-border pb-5">
            <CardTitle className="font-serif text-2xl sm:text-3xl font-normal">Partner Application</CardTitle>
            <CardDescription className="text-sm">Fields marked * are required.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Business Info */}
              <div>
                <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-5">Business Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      required
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder="e.g., The Ritz-Carlton"
                      className="rounded-none border-border bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select
                      value={formData.businessType}
                      onValueChange={(v) => handleSelectChange('businessType', v)}
                    >
                      <SelectTrigger className="rounded-none border-border bg-background">
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-none">
                        {BUSINESS_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      name="contactName"
                      required
                      value={formData.contactName}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      className="rounded-none border-border bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@company.com"
                      className="rounded-none border-border bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(555) 123-4567"
                      className="rounded-none border-border bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="flex gap-2">
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://yourcompany.com"
                        className="flex-1 rounded-none border-border bg-background"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={enrichWebsite}
                        disabled={enriching || !formData.website}
                        className="shrink-0 rounded-none border-border"
                      >
                        {enriching ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        <span className="ml-1 hidden sm:inline">Auto-fill</span>
                      </Button>
                    </div>
                    {companyLogo && (
                      <div className="flex items-center gap-2 mt-2 p-2 border border-border bg-muted/50">
                        <img
                          src={companyLogo}
                          alt="Company logo"
                          className="h-8 w-8 object-contain"
                        />
                        <span className="text-xs text-muted-foreground">Logo detected from website</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Products & Volume */}
              <div>
                <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-5">Products &amp; Volume</h3>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Products of Interest</Label>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {PRODUCT_INTERESTS.map(product => (
                        <label
                          key={product}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <Checkbox
                            checked={formData.productsInterested.includes(product)}
                            onCheckedChange={() => handleProductToggle(product)}
                          />
                          {product}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="estimatedMonthlyVolume">Estimated Monthly Volume</Label>
                      <Select
                        value={formData.estimatedMonthlyVolume}
                        onValueChange={(v) => handleSelectChange('estimatedMonthlyVolume', v)}
                      >
                        <SelectTrigger className="rounded-none border-border bg-background">
                          <SelectValue placeholder="Select range..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          {VOLUME_OPTIONS.map(v => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentSupplier">Current Supplier</Label>
                      <Input
                        id="currentSupplier"
                        name="currentSupplier"
                        value={formData.currentSupplier}
                        onChange={handleInputChange}
                        placeholder="Who do you currently source from?"
                        className="rounded-none border-border bg-background"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-5">Delivery Address</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress">Street Address</Label>
                    <Input
                      id="deliveryAddress"
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      placeholder="123 Main St"
                      className="rounded-none border-border bg-background"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Los Angeles"
                        className="rounded-none border-border bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="CA"
                        className="rounded-none border-border bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP</Label>
                      <Input
                        id="zip"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        placeholder="90015"
                        className="rounded-none border-border bg-background"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional */}
              <div>
                <h3 className="text-xs tracking-widest uppercase text-muted-foreground mb-5">Additional Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="howDidYouHear">How did you hear about us?</Label>
                    <Input
                      id="howDidYouHear"
                      name="howDidYouHear"
                      value={formData.howDidYouHear}
                      onChange={handleInputChange}
                      placeholder="Referral, Instagram, trade show, etc."
                      className="rounded-none border-border bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any specific requirements, preferred delivery days, special requests..."
                      rows={3}
                      className="rounded-none border-border bg-background"
                    />
                  </div>
                </div>
              </div>

              {referralCode && (
                <p className="text-sm text-green-700 border border-green-200 bg-green-50 px-3 py-2">
                  Referred by code <span className="font-mono font-medium">{referralCode}</span> — your referrer will earn $50 credit when you place your first order.
                </p>
              )}

              {error && (
                <p className="text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full bg-ink text-cream hover:bg-ink-dark rounded-none h-12 font-medium tracking-wide"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
              <p className="text-center text-xs text-sand leading-relaxed">
                Applications are reviewed within 24 hours. You&apos;ll receive a confirmation email once your wholesale account is approved.
              </p>
              <p className="text-center text-xs text-ink/40 mt-1">
                Already applied?{' '}
                <Link
                  href="/apply/status"
                  className="underline underline-offset-2 hover:text-ink/70 transition-colors"
                >
                  Check your application status
                </Link>{' '}
                &rarr;
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PartnerOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <PartnerOnboardingContent />
    </Suspense>
  )
}
