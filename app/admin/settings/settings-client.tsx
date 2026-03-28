'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  MessageSquare,
  CreditCard,
  Mail,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  Download,
} from 'lucide-react'

interface IntegrationStatus {
  name: string
  configured: boolean
  description: string
  icon: React.ReactNode
  envVars: string[]
  docsUrl?: string
}

interface ImportHistoryResult {
  imported: number
  orgs: number
}

export function SettingsClient() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  // Bloo.io history import state
  const [historyImporting, setHistoryImporting] = useState(false)
  const [historyResult, setHistoryResult] = useState<ImportHistoryResult | null>(null)
  const [historyError, setHistoryError] = useState<string | null>(null)

  useEffect(() => {
    async function checkIntegrations() {
      try {
        const res = await fetch('/api/admin/settings/integrations')
        if (res.ok) {
          const data = await res.json()
          setIntegrations(data.integrations)
        }
      } catch {
        // Set defaults
        setIntegrations([
          {
            name: 'Stripe',
            configured: false,
            description: 'Payment processing for orders',
            icon: null,
            envVars: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
          },
          {
            name: 'Bloo.io',
            configured: false,
            description: 'iMessage, SMS & RCS messaging',
            icon: null,
            envVars: ['BLOOIO_API_KEY', 'BLOOIO_FROM_NUMBER', 'BLOOIO_WEBHOOK_SECRET'],
          },
          {
            name: 'Resend',
            configured: false,
            description: 'Transactional email delivery',
            icon: null,
            envVars: ['RESEND_API_KEY'],
          },
          {
            name: 'Clerk',
            configured: false,
            description: 'Authentication & user management',
            icon: null,
            envVars: ['CLERK_SECRET_KEY'],
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    checkIntegrations()
  }, [])

  const iconMap: Record<string, React.ReactNode> = {
    Stripe: <CreditCard className="h-5 w-5" />,
    'Bloo.io': <MessageSquare className="h-5 w-5" />,
    Resend: <Mail className="h-5 w-5" />,
    Clerk: <Globe className="h-5 w-5" />,
  }

  function copyToClipboard(text: string, key: string) {
    try {
      navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Clipboard write failed, using fallback:', err)
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  async function importBlooHistory() {
    setHistoryImporting(true)
    setHistoryResult(null)
    setHistoryError(null)
    try {
      const res = await fetch('/api/admin/messages/import-history', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setHistoryResult(data)
      } else {
        setHistoryError(data.error ?? 'Import failed')
      }
    } catch {
      setHistoryError('Network error — import failed')
    } finally {
      setHistoryImporting(false)
    }
  }

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/blooio`
    : '/api/webhooks/blooio'

  const stripeWebhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/stripe`
    : '/api/webhooks/stripe'

  return (
    <>
      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Status of connected services and API keys</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-start gap-4 p-4 rounded-none border bg-white"
                >
                  <div className="rounded-full bg-muted p-2.5">
                    {iconMap[integration.name] || <Globe className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: integration.configured ? '#16a34a' : '#ca8a04',
                        }}
                        aria-hidden="true"
                      />
                      <h4 className="font-medium text-sm">{integration.name}</h4>
                      {integration.configured ? (
                        <Badge variant="outline" className="bg-neutral-900 text-white border-neutral-800 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-neutral-100 text-neutral-500 border-neutral-200 text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Not configured
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {integration.envVars.map((v) => (
                        <code key={v} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                          {v}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhook URLs */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook URLs</CardTitle>
          <CardDescription>Configure these URLs in your service dashboards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Bloo.io Webhook (iMessage/SMS events)</Label>
            <div className="flex gap-2">
              <Input value={webhookUrl} readOnly className="font-mono text-xs min-w-0" />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => copyToClipboard(webhookUrl, 'blooio')}
                aria-label="Copy Bloo.io webhook URL"
              >
                {copied === 'blooio' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Events: message.received, message.delivered, message.read, message.failed
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-xs font-medium">Stripe Webhook (payment events)</Label>
            <div className="flex gap-2">
              <Input value={stripeWebhookUrl} readOnly className="font-mono text-xs min-w-0" />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => copyToClipboard(stripeWebhookUrl, 'stripe')}
                aria-label="Copy Stripe webhook URL"
              >
                {copied === 'stripe' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Events: checkout.session.completed, payment_intent.payment_failed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Messaging */}
      <Card>
        <CardHeader>
          <CardTitle>Messaging</CardTitle>
          <CardDescription>Bloo.io iMessage history and configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <div>
              <h4 className="text-sm font-medium text-ink mb-1">Import Bloo.io Conversation History</h4>
              <p className="text-xs text-ink/50 mb-3">
                Pulls up to 100 messages per client from Bloo.io and saves them as conversation threads.
                Orgs that already have an imported history conversation are skipped.
              </p>
              <Button
                onClick={importBlooHistory}
                disabled={historyImporting}
                className="bg-ink text-cream hover:bg-ink/80 gap-1.5"
              >
                {historyImporting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Importing...</>
                ) : (
                  <><Download className="h-4 w-4" />Import Bloo.io Conversation History</>
                )}
              </Button>
            </div>

            {historyResult && (
              <div className="flex items-start gap-2 px-3 py-2.5 border border-shell bg-white text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span className="text-ink">
                  Imported <strong>{historyResult.imported}</strong> conversation{historyResult.imported === 1 ? '' : 's'} from <strong>{historyResult.orgs}</strong> org{historyResult.orgs === 1 ? '' : 's'}
                </span>
              </div>
            )}

            {historyError && (
              <div className="flex items-center gap-2 px-3 py-2.5 border border-amber-200 bg-amber-50 text-sm text-amber-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {historyError}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Service dashboards and documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-none border hover:bg-cream transition-colors"
            >
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Stripe Dashboard</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto" />
            </a>
            <a
              href="https://app.bloo.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-none border hover:bg-cream transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Bloo.io Dashboard</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto" />
            </a>
            <a
              href="https://resend.com/emails"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-none border hover:bg-cream transition-colors"
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Resend Dashboard</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto" />
            </a>
            <a
              href="https://dashboard.clerk.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-none border hover:bg-cream transition-colors"
            >
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Clerk Dashboard</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto" />
            </a>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
