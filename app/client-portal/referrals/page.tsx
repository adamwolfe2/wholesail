'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Copy, Check, Loader2, Gift, Users, DollarSign, Clock } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { PortalLayout } from '@/components/portal-nav'

const APP_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : 'https://wholesailhub.com'

interface ReferralRecord {
  id: string
  refereeEmail: string
  refereeName: string | null
  status: string
  creditAmount: number
  creditedAt: string | null
  createdAt: string
}

interface ReferralData {
  code: string | null
  referrals: ReferralRecord[]
  totalCredits: number
  pendingReferrals: number
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONVERTED: 'Converted',
  CREDITED: 'Credited',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  CONVERTED: 'bg-blue-50 text-blue-800 border-blue-200',
  CREDITED: 'bg-green-50 text-green-800 border-green-200',
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [sending, setSending] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [fetchError, setFetchError] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/client/referrals')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch {
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function generateCode() {
    setGenerating(true)
    try {
      const res = await fetch('/api/client/referrals/generate', { method: 'POST' })
      if (res.ok) {
        const json = await res.json()
        setData((prev) =>
          prev ? { ...prev, code: json.code } : null
        )
      }
    } catch {
      toast.error('Failed to generate code. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  function getReferralLink() {
    if (!data?.code) return ''
    return `${APP_URL}/refer/${data.code}`
  }

  async function copyLink() {
    const link = getReferralLink()
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail) return
    setSending(true)
    setInviteError(null)
    setInviteSuccess(false)

    try {
      const res = await fetch('/api/client/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, name: inviteName || undefined }),
      })
      const json = await res.json()
      if (!res.ok) {
        setInviteError(json.error || 'Something went wrong.')
      } else {
        setInviteSuccess(true)
        setInviteEmail('')
        setInviteName('')
        fetchData()
      }
    } catch {
      setInviteError('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const totalEarned = data?.referrals
    .filter((r) => r.status === 'CREDITED')
    .reduce((sum, r) => sum + r.creditAmount, 0) ?? 0

  return (
    <PortalLayout>
    <div className="space-y-8">
      {fetchError && (
        <div className="mb-4 rounded-none border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Unable to load data. Please refresh the page or try again later.
        </div>
      )}
      {/* Page header */}
      <div>
        <p className="text-xs tracking-widest uppercase text-sand mb-1">Referral Program</p>
        <h1 className="font-serif text-3xl text-ink">Refer &amp; Earn</h1>
        <p className="text-ink/60 mt-1 text-sm">
          Earn $50 credit for every business you refer that places their first order.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card className="border-shell">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-sand" />
              <span className="text-xs text-ink/50">Available Credits</span>
            </div>
            <p className="text-2xl font-bold text-ink">
              {loading ? '$—' : formatCurrency(data?.totalCredits ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-shell">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="h-4 w-4 text-sand" />
              <span className="text-xs text-ink/50">Total Earned</span>
            </div>
            <p className="text-2xl font-bold text-ink">
              {loading ? '$—' : formatCurrency(totalEarned)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-shell">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-sand" />
              <span className="text-xs text-ink/50">Total Referrals</span>
            </div>
            <p className="text-2xl font-bold text-ink">
              {loading ? '—' : (data?.referrals.length ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-shell">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-sand" />
              <span className="text-xs text-ink/50">Pending</span>
            </div>
            <p className="text-2xl font-bold text-ink">
              {loading ? '—' : (data?.pendingReferrals ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link Section */}
      <Card className="border-shell">
        <CardHeader className="border-b border-shell pb-4">
          <CardTitle className="font-serif text-xl font-normal text-ink">
            Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-ink/50 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : data?.code ? (
            <>
              <p className="text-sm text-ink/60">
                Share this link with businesses in your network. When they apply
                and place their first order, you earn $50 in account credit.
              </p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={getReferralLink()}
                  className="flex-1 rounded-none border-shell bg-cream font-mono text-sm text-ink"
                />
                <Button
                  onClick={copyLink}
                  variant="outline"
                  className="shrink-0 rounded-none border-ink text-ink hover:bg-ink hover:text-cream transition-colors min-w-[100px]"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-sand">
                Your code: <span className="font-mono font-medium text-ink">{data.code}</span>
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-ink/60">
                Generate your unique referral link to start earning credits.
              </p>
              <Button
                onClick={generateCode}
                disabled={generating}
                className="bg-ink text-cream hover:bg-ink/80 rounded-none"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate My Referral Link'
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Send Direct Invite */}
      <Card className="border-shell">
        <CardHeader className="border-b border-shell pb-4">
          <CardTitle className="font-serif text-xl font-normal text-ink">
            Send a Direct Invite
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={sendInvite} className="space-y-4">
            <p className="text-sm text-ink/60">
              Enter an email address and we&apos;ll send them a personal invitation from your account.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail" className="text-sm text-ink">
                  Email Address *
                </Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="contact@business.com"
                  className="rounded-none border-shell bg-cream"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inviteName" className="text-sm text-ink">
                  Name (optional)
                </Label>
                <Input
                  id="inviteName"
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Jane Smith"
                  className="rounded-none border-shell bg-cream"
                />
              </div>
            </div>

            {inviteError && (
              <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2">
                {inviteError}
              </p>
            )}
            {inviteSuccess && (
              <p className="text-sm text-green-700 border border-green-200 bg-green-50 px-3 py-2">
                Invite sent successfully.
              </p>
            )}

            <Button
              type="submit"
              disabled={sending || !inviteEmail}
              className="bg-ink text-cream hover:bg-ink/80 rounded-none"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Invite'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Referrals Table */}
      <Card className="border-shell">
        <CardHeader className="border-b border-shell pb-4">
          <CardTitle className="font-serif text-xl font-normal text-ink">
            Your Referrals
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-ink/50 text-sm gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading referrals...
            </div>
          ) : !data?.referrals.length ? (
            <EmptyState
              icon={Users}
              title="No referrals yet"
              description="Share your referral link to start earning credits."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-shell">
                  <TableHead className="text-xs uppercase tracking-widest text-sand font-normal">
                    Contact
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-widest text-sand font-normal">
                    Status
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-widest text-sand font-normal">
                    Date Referred
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-widest text-sand font-normal text-right">
                    Credit
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.referrals.map((referral) => (
                  <TableRow key={referral.id} className="border-b border-shell">
                    <TableCell>
                      <div>
                        {referral.refereeName && (
                          <p className="font-medium text-sm text-ink">
                            {referral.refereeName}
                          </p>
                        )}
                        <p className="text-sm text-ink/60">{referral.refereeEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${STATUS_COLORS[referral.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}
                      >
                        {STATUS_LABELS[referral.status] || referral.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-ink/60">
                      {format(new Date(referral.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      {referral.status === 'CREDITED' ? (
                        <span className="text-sm font-medium text-green-700">
                          +{formatCurrency(referral.creditAmount).slice(1)}
                        </span>
                      ) : (
                        <span className="text-sm text-ink/40">
                          {formatCurrency(referral.creditAmount)}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="border-shell bg-cream">
        <CardContent className="pt-6 pb-6">
          <p className="text-xs tracking-widest uppercase text-sand mb-4">How It Works</p>
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-2xl font-serif text-ink mb-2">01</p>
              <p className="font-medium text-sm text-ink mb-1">Share Your Link</p>
              <p className="text-xs text-ink/60 leading-relaxed">
                Copy your unique referral link and share it with businesses in your industry.
              </p>
            </div>
            <div>
              <p className="text-2xl font-serif text-ink mb-2">02</p>
              <p className="font-medium text-sm text-ink mb-1">They Apply &amp; Get Approved</p>
              <p className="text-xs text-ink/60 leading-relaxed">
                They fill out the wholesale application, our team reviews within 24 hours.
              </p>
            </div>
            <div>
              <p className="text-2xl font-serif text-ink mb-2">03</p>
              <p className="font-medium text-sm text-ink mb-1">You Earn $50</p>
              <p className="text-xs text-ink/60 leading-relaxed">
                When they place their first order, $50 is automatically added to your account credit balance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </PortalLayout>
  )
}
