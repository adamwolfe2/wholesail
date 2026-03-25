'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, Search } from 'lucide-react'

type State = 'idle' | 'searching' | 'submitting' | 'success' | 'not_found' | 'already_exists' | 'error'

// Tracks the two-phase claim flow independently of terminal states
type Phase = 'find' | 'confirm'

interface SearchResult {
  id: string
  name: string
  score: number
}

// Minimum chars before we trigger autocomplete search
const MIN_QUERY_CHARS = 2

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// Shared header used by all states
function PageHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-shell bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/60">
      <div className="container mx-auto flex h-14 sm:h-16 items-center px-3 sm:px-6 lg:px-8">
        <Link href="/" className="font-serif text-xl tracking-tight text-ink">
          Wholesail
        </Link>
      </div>
    </header>
  )
}

export default function ClaimPage() {
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Phase gate: user must explicitly find their account before sending
  const [phase, setPhase] = useState<Phase>('find')
  const [searchDone, setSearchDone] = useState(false) // true after at least one explicit search

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<SearchResult | null>(null)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const debouncedCompanyName = useDebounce(companyName, 350)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const companyInputRef = useRef<HTMLInputElement>(null)

  // ---------------------------------------------------------------------------
  // Fetch autocomplete suggestions whenever debounced company name changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // If user has already selected an org and company name still matches, don't re-search
    if (selectedOrg && selectedOrg.name === companyName) return

    if (debouncedCompanyName.length < MIN_QUERY_CHARS) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    let cancelled = false
    setIsLoadingSuggestions(true)

    const params = new URLSearchParams({ q: debouncedCompanyName })
    if (email.trim().length >= 4) params.set('email', email)
    if (phone.trim().length >= 7) params.set('phone', phone)

    fetch(`/api/claim/search?${params.toString()}`)
      .then(r => r.json())
      .then((data: { results?: SearchResult[] }) => {
        if (cancelled) return
        const results = data.results ?? []
        setSuggestions(results)
        setShowDropdown(results.length > 0)
        setHighlightedIndex(-1)
      })
      .catch(() => {
        if (!cancelled) setSuggestions([])
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSuggestions(false)
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCompanyName])

  // ---------------------------------------------------------------------------
  // Auto-search by email on blur (triggers suggestion lookup)
  // ---------------------------------------------------------------------------
  const handleEmailBlur = useCallback(() => {
    if (email.trim().length < 4) return
    if (selectedOrg) return // already confirmed

    const params = new URLSearchParams({ email: email.trim() })
    if (companyName.trim().length >= 2) params.set('q', companyName)
    if (phone.trim().length >= 7) params.set('phone', phone)

    fetch(`/api/claim/search?${params.toString()}`)
      .then(r => r.json())
      .then((data: { results?: SearchResult[] }) => {
        const results = data.results ?? []
        if (results.length > 0 && results[0].score >= 80) {
          // High-confidence auto-confirm → advance to phase 2
          setSelectedOrg(results[0])
          if (!companyName.trim()) setCompanyName(results[0].name)
          setPhase('confirm')
          setSuggestions([])
          setShowDropdown(false)
        } else if (results.length > 0) {
          setSuggestions(results)
          setShowDropdown(companyName.trim().length >= MIN_QUERY_CHARS)
        }
      })
      .catch(() => {})
  }, [email, companyName, phone, selectedOrg])

  // ---------------------------------------------------------------------------
  // Select an org from the dropdown → advance to confirm phase
  // ---------------------------------------------------------------------------
  const selectOrg = useCallback((org: SearchResult) => {
    setSelectedOrg(org)
    setCompanyName(org.name)
    setPhase('confirm')
    setSuggestions([])
    setShowDropdown(false)
    setHighlightedIndex(-1)
  }, [])

  // ---------------------------------------------------------------------------
  // Clear confirmed org when user edits company name field
  // ---------------------------------------------------------------------------
  const handleCompanyNameChange = useCallback((value: string) => {
    setCompanyName(value)
    if (selectedOrg && value !== selectedOrg.name) {
      setSelectedOrg(null)
      setPhase('find')
    }
  }, [selectedOrg])

  // ---------------------------------------------------------------------------
  // Keyboard navigation for dropdown
  // ---------------------------------------------------------------------------
  const handleCompanyKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault()
      selectOrg(suggestions[highlightedIndex])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }, [showDropdown, suggestions, highlightedIndex, selectOrg])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ---------------------------------------------------------------------------
  // "Find My Account" — REQUIRED phase 1 step before any invite is sent
  // ---------------------------------------------------------------------------
  const handleSearch = useCallback(async () => {
    if (!email.trim()) return
    setState('searching')
    setErrorMessage(null)
    setSearchDone(true)

    const params = new URLSearchParams({ email: email.trim() })
    if (companyName.trim().length >= 2) params.set('q', companyName)
    if (phone.trim().length >= 7) params.set('phone', phone)

    try {
      const res = await fetch(`/api/claim/search?${params.toString()}`)
      const data: { results?: SearchResult[] } = await res.json()
      const results = data.results ?? []

      if (results.length > 0) {
        setSelectedOrg(results[0])
        if (!companyName.trim()) setCompanyName(results[0].name)
        setPhase('confirm') // ← gate opens only here
      } else {
        // No match found — stay on phase 'find', show inline message
        setSelectedOrg(null)
        setPhase('find')
      }
    } catch {
      // Network error — stay on find phase, user can retry
    } finally {
      setState('idle')
    }
  }, [email, companyName, phone])

  // ---------------------------------------------------------------------------
  // Final submit — send the Clerk invite
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Hard gate — invite cannot be sent until the user has confirmed their org
    if (phase !== 'confirm' || !selectedOrg) {
      return
    }

    setState('submitting')
    setErrorMessage(null)

    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          companyName: companyName || undefined,
          phone: phone || undefined,
        }),
      })

      const data = await res.json()

      if (res.status === 400) {
        setErrorMessage(data.error || 'Invalid request. Please check your input.')
        setState('error')
        return
      }

      if (res.status === 429) {
        setErrorMessage('Too many requests. Please wait a moment and try again.')
        setState('error')
        return
      }

      if (!res.ok) {
        setErrorMessage(data.error || 'Something went wrong. Please try again.')
        setState('error')
        return
      }

      if (data.result === 'already_exists') {
        setState('already_exists')
      } else if (data.result === 'not_found') {
        setState('not_found')
      } else {
        setState('success')
      }
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.')
      setState('error')
    }
  }

  // ---------------------------------------------------------------------------
  // Terminal states
  // ---------------------------------------------------------------------------
  if (state === 'success') {
    return (
      <div className="min-h-screen bg-cream">
        <PageHeader />
        <div className="container mx-auto px-3 py-20 sm:px-6 lg:px-8 max-w-2xl text-center">
          <p className="text-xs tracking-widest uppercase text-ink/50 mb-6">Invitation Sent</p>
          <h1 className="font-serif text-4xl sm:text-5xl mb-6 leading-tight text-ink">
            Check your email.
          </h1>
          <p className="text-ink/70 mb-3 leading-relaxed">
            We&apos;ve sent an invitation link to <strong>{email}</strong>.
          </p>
          <p className="text-ink/70 mb-10 leading-relaxed">
            Click the link in the email to set up your password and access your order history and invoices. The link expires in 24 hours.
          </p>
          <p className="text-sm text-sand">
            Didn&apos;t receive it? Check your spam folder, or email{' '}
            <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || "orders@wholesailhub.com"}`} className="underline underline-offset-2">
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL || "orders@wholesailhub.com"}
            </a>
            .
          </p>
        </div>
      </div>
    )
  }

  if (state === 'already_exists') {
    return (
      <div className="min-h-screen bg-cream">
        <PageHeader />
        <div className="container mx-auto px-3 py-20 sm:px-6 lg:px-8 max-w-2xl text-center">
          <p className="text-xs tracking-widest uppercase text-ink/50 mb-6">Already Active</p>
          <h1 className="font-serif text-4xl sm:text-5xl mb-6 leading-tight text-ink">
            Account already exists.
          </h1>
          <p className="text-ink/70 mb-6 leading-relaxed">
            An account for <strong>{email}</strong> is already set up. Try signing in — or check your email for a previous invitation.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild size="lg" className="bg-ink text-cream hover:bg-ink/80 rounded-none">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
          <p className="mt-8 text-sm text-sand">
            Having trouble?{' '}
            <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || "orders@wholesailhub.com"}`} className="underline underline-offset-2">
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL || "orders@wholesailhub.com"}
            </a>
          </p>
        </div>
      </div>
    )
  }

  if (state === 'not_found') {
    return (
      <div className="min-h-screen bg-cream">
        <PageHeader />
        <div className="container mx-auto px-3 py-20 sm:px-6 lg:px-8 max-w-2xl text-center">
          <p className="text-xs tracking-widest uppercase text-ink/50 mb-6">Not Found</p>
          <h1 className="font-serif text-4xl sm:text-5xl mb-6 leading-tight text-ink">
            We couldn&apos;t find your account.
          </h1>
          <p className="text-ink/70 mb-3 leading-relaxed">
            We couldn&apos;t find a wholesale account matching that information.
          </p>
          <p className="text-ink/70 mb-10 leading-relaxed">
            Email us at{' '}
            <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || "orders@wholesailhub.com"}`} className="underline underline-offset-2 text-ink">
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL || "orders@wholesailhub.com"}
            </a>{' '}
            and we&apos;ll help you get access.
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="lg"
              className="border-shell rounded-none"
              onClick={() => { setState('idle'); setErrorMessage(null) }}
            >
              Try Again
            </Button>
            <Button asChild size="lg" className="bg-ink text-cream hover:bg-ink/80 rounded-none">
              <Link href="/partner">Apply for Access</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isSearching = state === 'searching'
  const isSubmitting = state === 'submitting'
  const isDisabled = isSearching || isSubmitting

  return (
    <div className="min-h-screen bg-cream">
      <PageHeader />

      <div className="container mx-auto px-3 py-10 sm:px-6 sm:py-16 lg:px-8 max-w-2xl">
        <Link
          href="/"
          className="inline-block text-xs tracking-widest uppercase text-ink/50 hover:text-ink transition-colors mb-10"
        >
          Back to Marketplace
        </Link>

        {/* Hero */}
        <div className="mb-10">
          <p className="text-xs tracking-widest uppercase text-ink/50 mb-3">Wholesale Partners</p>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight mb-4 leading-tight text-ink">
            Access Your Account
          </h1>
          <p className="text-base text-ink/60 leading-relaxed">
            Already a Wholesail wholesale partner? Claim your account to view your order history and invoices.
          </p>
        </div>

        {/* Form card */}
        <Card className="border-shell rounded-none shadow-none bg-white">
          <CardHeader className="border-b border-shell pb-5">
            <CardTitle className="font-serif text-2xl font-normal text-ink">
              Claim Your Account
            </CardTitle>
            <CardDescription className="text-sm text-ink/50">
              Enter your business email and company name — we&apos;ll find your account and send you a login link.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-ink">
                  Email Address <span className="text-ink/40">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  placeholder="you@yourcompany.com"
                  className="rounded-none border-shell bg-cream focus-visible:ring-0 focus-visible:border-ink"
                  disabled={isDisabled}
                />
              </div>

              {/* Company Name with autocomplete */}
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-ink">
                  Company Name <span className="text-ink/40">(recommended — helps us find your account)</span>
                </Label>
                <div className="relative" ref={dropdownRef}>
                  <div className="relative">
                    <Input
                      id="companyName"
                      ref={companyInputRef}
                      type="text"
                      value={companyName}
                      onChange={e => handleCompanyNameChange(e.target.value)}
                      onKeyDown={handleCompanyKeyDown}
                      onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                      placeholder="e.g., The Ritz-Carlton Los Angeles"
                      className="rounded-none border-shell bg-cream focus-visible:ring-0 focus-visible:border-ink pr-8"
                      disabled={isDisabled}
                      autoComplete="off"
                    />
                    {isLoadingSuggestions && (
                      <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-ink/30" />
                    )}
                  </div>

                  {/* Dropdown */}
                  {showDropdown && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full bg-white border border-shell border-t-0 shadow-lg">
                      {suggestions.map((s, i) => (
                        <button
                          key={s.id}
                          type="button"
                          onMouseDown={e => { e.preventDefault(); selectOrg(s) }}
                          className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between gap-3 transition-colors
                            ${i === highlightedIndex ? 'bg-cream' : 'hover:bg-cream/60'}
                            ${i < suggestions.length - 1 ? 'border-b border-shell' : ''}
                          `}
                        >
                          <span className="text-ink font-medium truncate">{s.name}</span>
                          <span className="text-ink/30 text-xs shrink-0">
                            {s.score >= 80 ? 'Strong match' : s.score >= 40 ? 'Possible match' : 'Partial match'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-ink">
                  Phone Number <span className="text-ink/40">(optional — additional verification)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="rounded-none border-shell bg-cream focus-visible:ring-0 focus-visible:border-ink"
                  disabled={isDisabled}
                />
              </div>

              {/* ── PHASE 1: Find My Account ── */}
              {phase === 'find' && (
                <>
                  {/* Inline "not found" after a search that returned nothing */}
                  {searchDone && !selectedOrg && state !== 'searching' && (
                    <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      <p className="font-medium mb-1">No account found</p>
                      <p className="text-amber-700">
                        We couldn&apos;t match that information to an existing account. Try a different email or company name, or{' '}
                        <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || "orders@wholesailhub.com"}`} className="underline underline-offset-2">
                          contact us
                        </a>
                        .
                      </p>
                    </div>
                  )}

                  {state === 'error' && errorMessage && (
                    <p className="text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">
                      {errorMessage}
                    </p>
                  )}

                  <Button
                    type="button"
                    size="lg"
                    className="w-full bg-ink text-cream hover:bg-ink/80 rounded-none h-12 font-medium tracking-wide"
                    onClick={handleSearch}
                    disabled={isDisabled || !email.trim()}
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Find My Account
                      </>
                    )}
                  </Button>
                </>
              )}

              {/* ── PHASE 2: Confirm then send ── */}
              {phase === 'confirm' && selectedOrg && (
                <>
                  {/* Green confirmation card */}
                  <div className="flex items-start gap-3 border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-emerald-800">Account found</p>
                      <p className="text-sm text-emerald-700 truncate">{selectedOrg.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrg(null)
                        setCompanyName('')
                        setPhase('find')
                        setSearchDone(false)
                      }}
                      className="ml-auto text-xs text-emerald-600 hover:text-emerald-800 shrink-0 underline underline-offset-2"
                      disabled={isDisabled}
                    >
                      Not you?
                    </button>
                  </div>

                  {state === 'error' && errorMessage && (
                    <p className="text-sm text-destructive border border-destructive/30 bg-destructive/5 px-3 py-2">
                      {errorMessage}
                    </p>
                  )}

                  {/* Send invite — only available after confirmation */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-none h-12 font-medium tracking-wide"
                    disabled={isDisabled}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending invitation...
                      </>
                    ) : (
                      'Send Me Access'
                    )}
                  </Button>
                </>
              )}

              <p className="text-center text-xs text-sand leading-relaxed">
                New to Wholesail?{' '}
                <Link href="/partner" className="underline underline-offset-2 hover:text-ink/60 transition-colors">
                  Apply for wholesale access
                </Link>
                .
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Help section */}
        <div className="mt-10 pt-10 border-t border-shell">
          <p className="text-xs tracking-widest uppercase text-ink/40 mb-4">Need help?</p>
          <p className="text-sm text-ink/60 leading-relaxed">
            If you placed orders with us before our new portal launched, your account already exists — just enter the
            email we have on file. Can&apos;t remember which email? Reach us at{' '}
            <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || "orders@wholesailhub.com"}`} className="text-ink underline underline-offset-2">
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL || "orders@wholesailhub.com"}
            </a>{' '}
            and we&apos;ll sort it out.
          </p>
        </div>
      </div>
    </div>
  )
}
