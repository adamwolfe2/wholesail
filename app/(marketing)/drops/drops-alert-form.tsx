'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

interface Props {
  dropId?: string
  compact?: boolean
}

export function DropsAlertForm({ dropId, compact = false }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/drops/alert-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined, dropId }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex items-start gap-3">
        <div className="h-7 w-7 border border-[#0A0A0A] flex items-center justify-center shrink-0 mt-0.5">
          <Check className="h-3.5 w-3.5 text-[#0A0A0A]" />
        </div>
        <div>
          <p className="font-medium text-[#0A0A0A] text-sm">
            {"You're on the list."}
          </p>
          <p className="text-xs text-[#0A0A0A]/50 mt-0.5">
            {"We'll reach out before this drop."}
          </p>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full h-10 px-3 bg-white border border-[#E5E1DB] text-[#0A0A0A] placeholder:text-[#C8C0B4] text-sm focus:outline-none focus:border-[#0A0A0A] transition-colors"
        />
        {error && <p className="text-red-600 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 bg-[#0A0A0A] text-[#F9F7F4] text-xs font-medium uppercase tracking-wider hover:bg-[#0A0A0A]/80 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {loading ? 'Signing up…' : 'Notify Me'}
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="h-12 px-4 bg-white border border-[#E5E1DB] text-[#0A0A0A] placeholder:text-[#C8C0B4] text-sm focus:outline-none focus:border-[#0A0A0A] transition-colors"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="h-12 px-4 bg-white border border-[#E5E1DB] text-[#0A0A0A] placeholder:text-[#C8C0B4] text-sm focus:outline-none focus:border-[#0A0A0A] transition-colors"
        />
      </div>
      {error && <p className="text-red-600 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="h-12 px-8 bg-[#0A0A0A] text-[#F9F7F4] text-sm font-medium hover:bg-[#0A0A0A]/80 transition-colors disabled:opacity-60 flex items-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Sign Me Up
      </button>
      <p className="text-[#C8C0B4] text-xs tracking-wide">
        No spam. Just early access. Unsubscribe anytime.
      </p>
    </form>
  )
}
