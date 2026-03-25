'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface WholesaleReviewActionsProps {
  applicationId: string
  currentStatus: string
}

export function WholesaleReviewActions({
  applicationId,
  currentStatus,
}: WholesaleReviewActionsProps) {
  const router = useRouter()
  const [reviewNotes, setReviewNotes] = useState('')
  const [loading, setLoading] = useState<'approve' | 'reject' | 'waitlist' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isReviewed = currentStatus !== 'PENDING'

  async function handleAction(action: 'approve' | 'reject' | 'waitlist') {
    setLoading(action)
    setError(null)

    try {
      const res = await fetch(`/api/admin/wholesale/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reviewNotes: reviewNotes || undefined }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
        return
      }

      router.push('/admin/wholesale')
      router.refresh()
    } catch {
      setError('A network error occurred. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  if (isReviewed) return null

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="reviewNotes" className="text-sm font-medium text-ink">
          Review Notes <span className="text-ink/40 font-normal">(optional)</span>
        </Label>
        <Textarea
          id="reviewNotes"
          value={reviewNotes}
          onChange={e => setReviewNotes(e.target.value)}
          rows={3}
          className="border-black focus-visible:ring-0 focus-visible:border-black resize-none"
          placeholder="Internal notes about this decision (not sent to applicant on waitlist)..."
        />
      </div>

      {error && (
        <div className="border border-red-500 p-3 text-sm text-red-700 bg-red-50">
          {error}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <Button
          onClick={() => handleAction('approve')}
          disabled={loading !== null}
          className="bg-green-700 hover:bg-green-800 text-white font-medium"
        >
          {loading === 'approve' ? 'Approving...' : 'Approve'}
        </Button>
        <Button
          onClick={() => handleAction('waitlist')}
          disabled={loading !== null}
          variant="outline"
          className="border-blue-600 text-blue-700 hover:bg-blue-50 font-medium"
        >
          {loading === 'waitlist' ? 'Waitlisting...' : 'Waitlist'}
        </Button>
        <Button
          onClick={() => handleAction('reject')}
          disabled={loading !== null}
          variant="outline"
          className="border-red-500 text-red-600 hover:bg-red-50 font-medium"
        >
          {loading === 'reject' ? 'Rejecting...' : 'Reject'}
        </Button>
      </div>
    </div>
  )
}
