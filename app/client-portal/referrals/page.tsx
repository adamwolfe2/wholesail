'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { format } from 'date-fns'

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

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/client/referrals')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch {
      // fail silently
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
      // fail silently
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
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <p className="text-xs tracking-widest uppercase text-[#C8C0B4] mb-1">Referral Program</p>
        <h1 className="font-serif text-3xl text-[#0A0A0A]">Refer &amp; Earn</h1>
        <p className="text-[#0A0A0A]/60 mt-1 text-sm">
          Earn $50 credit for every restaurant you refer that places their first order.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card className="border-[#E5E1DB]">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-[#C8C0B4]" />
              <span className="text-xs text-[#0A0A0A]/50">Available Credits</span>
            </div>
            <p className="text-2xl font-bold text-[#0A0A0A]">
              ${loading ? '—' : (data?.totalCredits ?? 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-[#E5E1DB]">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="h-4 w-4 text-[#C8C0B4]" />
              <span className="text-xs text-[#0A0A0A]/50">Total Earned</span>
            </div>
            <p className="text-2xl font-bold text-[#0A0A0A]">
              ${loading ? '—' : totalEarned.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-[#E5E1DB]">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-[#C8C0B4]" />
              <span className="text-xs text-[#0A0A0A]/50">Total Referrals</span>
            </div>
            <p className="text-2xl font-bold text-[#0A0A0A]">
              {loading ? '—' : (data?.referrals.length ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-[#E5E1DB]">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-[#C8C0B4]" />
              <span className="text-xs text-[#0A0A0A]/50">Pending</span>
            </div>
            <p className="text-2xl font-bold text-[#0A0A0A]">
              {loading ? '—' : (data?.pendingReferrals ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link Section */}
      <Card className="border-[#E5E1DB]">
        <CardHeader className="border-b border-[#E5E1DB] pb-4">
          <CardTitle className="font-serif text-xl font-normal text-[#0A0A0A]">
            Your Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-[#0A0A0A]/50 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : data?.code ? (
            <>
              <p className="text-sm text-[#0A0A0A]/60">
                Share this link with restaurants and culinary professionals. When they apply
                and place their first order, you earn $50 in account credit.
              </p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={getReferralLink()}
                  className="flex-1 rounded-none border-[#E5E1DB] bg-[#F9F7F4] font-mono text-sm text-[#0A0A0A]"
                />
                <Button
                  onClick={copyLink}
                  variant="outline"
                  className="shrink-0 rounded-none border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#F9F7F4] transition-colors min-w-[100px]"
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
              <p className="text-xs text-[#C8C0B4]">
                Your code: <span className="font-mono font-medium text-[#0A0A0A]">{data.code}</span>
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-[#0A0A0A]/60">
                Generate your unique referral link to start earning credits.
              </p>
              <Button
                onClick={generateCode}
                disabled={generating}
                className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#1A1614] rounded-none"
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
      <Card className="border-[#E5E1DB]">
        <CardHeader className="border-b border-[#E5E1DB] pb-4">
          <CardTitle className="font-serif text-xl font-normal text-[#0A0A0A]">
            Send a Direct Invite
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={sendInvite} className="space-y-4">
            <p className="text-sm text-[#0A0A0A]/60">
              Enter an email address and we&apos;ll send them a personal invitation from your account.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail" className="text-sm text-[#0A0A0A]">
                  Email Address *
                </Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="chef@restaurant.com"
                  className="rounded-none border-[#E5E1DB] bg-[#F9F7F4]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inviteName" className="text-sm text-[#0A0A0A]">
                  Name (optional)
                </Label>
                <Input
                  id="inviteName"
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Chef Marco"
                  className="rounded-none border-[#E5E1DB] bg-[#F9F7F4]"
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
              className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#1A1614] rounded-none"
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
      <Card className="border-[#E5E1DB]">
        <CardHeader className="border-b border-[#E5E1DB] pb-4">
          <CardTitle className="font-serif text-xl font-normal text-[#0A0A0A]">
            Your Referrals
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-[#0A0A0A]/50 text-sm gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading referrals...
            </div>
          ) : !data?.referrals.length ? (
            <div className="py-12 text-center">
              <p className="text-[#0A0A0A]/50 text-sm">
                No referrals yet. Share your link to start earning.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#E5E1DB]">
                  <TableHead className="text-xs uppercase tracking-widest text-[#C8C0B4] font-normal">
                    Contact
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-widest text-[#C8C0B4] font-normal">
                    Status
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-widest text-[#C8C0B4] font-normal">
                    Date Referred
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-widest text-[#C8C0B4] font-normal text-right">
                    Credit
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.referrals.map((referral) => (
                  <TableRow key={referral.id} className="border-b border-[#E5E1DB]">
                    <TableCell>
                      <div>
                        {referral.refereeName && (
                          <p className="font-medium text-sm text-[#0A0A0A]">
                            {referral.refereeName}
                          </p>
                        )}
                        <p className="text-sm text-[#0A0A0A]/60">{referral.refereeEmail}</p>
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
                    <TableCell className="text-sm text-[#0A0A0A]/60">
                      {format(new Date(referral.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      {referral.status === 'CREDITED' ? (
                        <span className="text-sm font-medium text-green-700">
                          +${referral.creditAmount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-sm text-[#0A0A0A]/40">
                          ${referral.creditAmount.toFixed(2)}
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
      <Card className="border-[#E5E1DB] bg-[#F9F7F4]">
        <CardContent className="pt-6 pb-6">
          <p className="text-xs tracking-widest uppercase text-[#C8C0B4] mb-4">How It Works</p>
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-2xl font-serif text-[#0A0A0A] mb-2">01</p>
              <p className="font-medium text-sm text-[#0A0A0A] mb-1">Share Your Link</p>
              <p className="text-xs text-[#0A0A0A]/60 leading-relaxed">
                Copy your unique referral link and share it with restaurants, hotels, or culinary professionals.
              </p>
            </div>
            <div>
              <p className="text-2xl font-serif text-[#0A0A0A] mb-2">02</p>
              <p className="font-medium text-sm text-[#0A0A0A] mb-1">They Apply &amp; Get Approved</p>
              <p className="text-xs text-[#0A0A0A]/60 leading-relaxed">
                They fill out the wholesale application, our team reviews within 24 hours.
              </p>
            </div>
            <div>
              <p className="text-2xl font-serif text-[#0A0A0A] mb-2">03</p>
              <p className="font-medium text-sm text-[#0A0A0A] mb-1">You Earn $50</p>
              <p className="text-xs text-[#0A0A0A]/60 leading-relaxed">
                When they place their first order, $50 is automatically added to your account credit balance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
