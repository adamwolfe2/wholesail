'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface ApplicationResult {
  status: 'PENDING' | 'APPROVED' | 'WAITLISTED' | 'REJECTED' | 'NOT_FOUND'
  businessName?: string
  submittedAt?: string
  reviewedAt?: string
  reviewNotes?: string
}

function StatusIndicator({ status }: { status: ApplicationResult['status'] }) {
  if (status === 'PENDING') {
    return (
      <div className="flex items-start gap-4 p-5 border border-amber-300 bg-amber-50">
        <div className="mt-0.5 h-3 w-3 shrink-0 bg-amber-400" />
        <div>
          <p className="font-medium text-amber-900 mb-1">Under Review</p>
          <p className="text-sm text-amber-800 leading-relaxed">
            Your application is under review. We typically respond within 2–3 business days.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'APPROVED') {
    return (
      <div className="flex items-start gap-4 p-5 border border-green-300 bg-green-50">
        <div className="mt-0.5 h-3 w-3 shrink-0 bg-green-500" />
        <div>
          <p className="font-medium text-green-900 mb-1">Approved</p>
          <p className="text-sm text-green-800 leading-relaxed">
            Congratulations! Your application has been approved. Check your email for an invitation link to set up your wholesale account.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'WAITLISTED') {
    return (
      <div className="flex items-start gap-4 p-5 border border-blue-300 bg-blue-50">
        <div className="mt-0.5 h-3 w-3 shrink-0 bg-blue-400" />
        <div>
          <p className="font-medium text-blue-900 mb-1">Waitlisted</p>
          <p className="text-sm text-blue-800 leading-relaxed">
            You&apos;ve been added to our waitlist. We&apos;ll reach out when space opens up.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'REJECTED') {
    return (
      <div className="flex items-start gap-4 p-5 border border-shell bg-cream">
        <div className="mt-0.5 h-3 w-3 shrink-0 bg-sand" />
        <div>
          <p className="font-medium text-ink mb-1">Application Not Approved</p>
          <p className="text-sm text-ink/60 leading-relaxed">
            Unfortunately, we&apos;re unable to approve your application at this time. You&apos;re welcome to reapply in 90 days or reach us at{' '}
            <a href="mailto:orders@wholesailhub.com" className="underline underline-offset-2">
              orders@wholesailhub.com
            </a>.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'NOT_FOUND') {
    return (
      <div className="flex items-start gap-4 p-5 border border-shell bg-cream">
        <div className="mt-0.5 h-3 w-3 shrink-0 bg-sand" />
        <div>
          <p className="font-medium text-ink mb-1">No Application Found</p>
          <p className="text-sm text-ink/60 leading-relaxed">
            No application was found for this email address.{' '}
            <Link href="/partner" className="underline underline-offset-2 text-ink">
              Apply for wholesale access
            </Link>.
          </p>
        </div>
      </div>
    )
  }

  return null
}

export default function ApplicationStatusPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApplicationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(
        `/api/wholesale/status?email=${encodeURIComponent(email.trim())}`
      )
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      setResult(data)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-shell bg-cream">
        <div className="container mx-auto flex h-14 items-center px-4 sm:px-6">
          <Link href="/" className="font-serif text-xl tracking-tight text-ink">
            Wholesail
          </Link>
          <span className="mx-3 text-sand">/</span>
          <span className="text-sm text-ink/50">Application Status</span>
        </div>
      </header>

      {/* Main */}
      <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 max-w-lg">
        <div className="text-center mb-10">
          <p className="text-xs tracking-widest uppercase text-sand mb-3">
            Wholesale Partnership
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-ink mb-3">
            Check Application Status
          </h1>
          <p className="text-sm text-ink/50 leading-relaxed">
            Enter the email address you used when you applied.
          </p>
        </div>

        <Card className="border-shell bg-white">
          <CardHeader className="border-b border-shell pb-4">
            <CardTitle className="font-serif text-lg font-normal text-ink">
              Your Application
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCheck} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-ink/70">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="rounded-none border-shell bg-cream focus:border-ink"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-ink text-cream hover:bg-ink/80 rounded-none h-11"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Status'
                )}
              </Button>
            </form>

            {/* Result */}
            {result && (
              <div className="mt-6 space-y-4">
                <div className="border-t border-shell pt-6">
                  {result.businessName && (
                    <p className="text-xs text-ink/40 uppercase tracking-widest mb-3">
                      {result.businessName}
                    </p>
                  )}
                  <StatusIndicator status={result.status} />

                  {result.submittedAt && (
                    <p className="text-xs text-ink/40 mt-3">
                      Submitted{' '}
                      {new Date(result.submittedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  )}

                  {result.reviewNotes && (
                    <div className="mt-3 border border-shell bg-cream px-4 py-3">
                      <p className="text-xs text-ink/50 uppercase tracking-widest mb-1">
                        Notes
                      </p>
                      <p className="text-sm text-ink/70 leading-relaxed">
                        {result.reviewNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-sand mt-8">
          Questions?{' '}
          <a
            href="mailto:orders@wholesailhub.com"
            className="underline underline-offset-2 hover:text-ink/50 transition-colors"
          >
            orders@wholesailhub.com
          </a>
        </p>
      </div>
    </div>
  )
}
