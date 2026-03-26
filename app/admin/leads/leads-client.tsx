'use client'

import { useState, useRef, useTransition, useCallback } from 'react'
import { format } from 'date-fns'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Plus, Upload, CheckCircle2, XCircle, Loader2, Zap, ExternalLink,
  Globe, Building2, AlertCircle, ChevronDown,
} from 'lucide-react'

type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST'

interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  website: string | null
  source: string
  status: LeadStatus
  notes: string | null
  emailBisonId: string | null
  pushedAt: string | null
  createdAt: string
}

interface EnrichResult {
  companyName: string
  description: string
  phone: string | null
  city: string | null
}

interface BulkResult {
  imported: number
  failed: number
  skipped: number
  errors: string[]
}

/* ─── Status / Source helpers ────────────────────────────── */
const STATUS_COLORS: Record<LeadStatus, string> = {
  NEW: 'bg-sand/20 text-ink/60',
  CONTACTED: 'bg-blue-50 text-blue-700',
  QUALIFIED: 'bg-amber-50 text-amber-700',
  CONVERTED: 'bg-ink text-cream',
  LOST: 'bg-gray-100 text-gray-500',
}
const ALL_STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase ${STATUS_COLORS[status]}`}>
      {status}
    </span>
  )
}

function CampaignBadge({ pushed }: { pushed: boolean }) {
  if (pushed) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase bg-emerald-50 text-emerald-700">
        <CheckCircle2 className="h-2.5 w-2.5" />
        In Campaign
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase bg-gray-100 text-gray-400">
      Not Pushed
    </span>
  )
}

/* ─── CSV parser (browser-side) ─────────────────────────── */
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
  return lines.slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
      const row: Record<string, string> = {}
      headers.forEach((h, i) => { row[h] = values[i] || '' })
      return row
    })
}

/* ─── Single Lead Add Tab ───────────────────────────────── */
function AddLeadTab({ onLeadAdded }: { onLeadAdded: (lead: Lead) => void }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    website: '',
    phone: '',
  })
  const [enriching, setEnriching] = useState(false)
  const [enrichResult, setEnrichResult] = useState<EnrichResult | null>(null)
  const [enrichError, setEnrichError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; emailBisonId?: string | null; configured?: boolean } | null>(null)
  const [submitError, setSubmitError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleEnrich() {
    if (!form.website) return
    setEnriching(true)
    setEnrichError('')
    setEnrichResult(null)
    try {
      let url = form.website.trim()
      if (!/^https?:\/\//i.test(url)) url = `https://${url}`
      const res = await fetch('/api/admin/leads/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website: url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Enrichment failed')
      setEnrichResult(data)
      // Pre-fill company if blank
      if (data.companyName && !form.company) {
        setForm((f) => ({ ...f, company: data.companyName }))
      }
      if (data.phone && !form.phone) {
        setForm((f) => ({ ...f, phone: data.phone }))
      }
    } catch (err) {
      setEnrichError(err instanceof Error ? err.message : 'Enrichment failed')
    } finally {
      setEnriching(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    setSubmitResult(null)
    try {
      let website = form.website.trim()
      if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`
      const res = await fetch('/api/admin/leads/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          website: website || undefined,
          description: enrichResult?.description || '',
          city: enrichResult?.city || '',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setSubmitResult({ success: true, emailBisonId: data.emailBisonId, configured: data.configured })
      onLeadAdded({
        ...data.lead,
        pushedAt: data.lead.pushedAt ?? null,
        emailBisonId: data.lead.emailBisonId ?? null,
        website: data.lead.website ?? null,
        phone: data.lead.phone ?? null,
        company: data.lead.company ?? null,
        notes: data.lead.notes ?? null,
      })
      setForm({ firstName: '', lastName: '', email: '', company: '', website: '', phone: '' })
      setEnrichResult(null)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to add lead')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitResult?.success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-12 h-12 bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
        <div className="text-center">
          <p className="font-serif text-lg font-bold text-ink">Lead Added</p>
          {submitResult.configured && submitResult.emailBisonId ? (
            <p className="text-sm text-ink/50 mt-1">
              Pushed to EmailBison campaign · ID: <code className="font-mono text-xs">{submitResult.emailBisonId}</code>
            </p>
          ) : submitResult.configured ? (
            <p className="text-sm text-amber-600 mt-1">Saved to pipeline — EmailBison push failed (check logs)</p>
          ) : (
            <p className="text-sm text-ink/40 mt-1">Saved to pipeline · EmailBison not yet configured</p>
          )}
        </div>
        <Button
          variant="outline"
          className="border-shell mt-2"
          onClick={() => setSubmitResult(null)}
        >
          Add Another Lead
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-ink/60 uppercase tracking-wide">First Name *</Label>
          <Input
            required
            value={form.firstName}
            onChange={set('firstName')}
            placeholder="Alex"
            className="border-shell bg-white focus-visible:ring-0 focus-visible:border-ink"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Last Name</Label>
          <Input
            value={form.lastName}
            onChange={set('lastName')}
            placeholder="Chen"
            className="border-shell bg-white focus-visible:ring-0 focus-visible:border-ink"
          />
        </div>
      </div>

      {/* Email + Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Email *</Label>
          <Input
            required
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="chef@restaurant.com"
            className="border-shell bg-white focus-visible:ring-0 focus-visible:border-ink"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Company / Restaurant</Label>
          <Input
            value={form.company}
            onChange={set('company')}
            placeholder="The Capital Grille"
            className="border-shell bg-white focus-visible:ring-0 focus-visible:border-ink"
          />
        </div>
      </div>

      {/* Website + Enrich */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-ink/60 uppercase tracking-wide">
          Website <span className="text-sand normal-case font-normal">(optional — used to enrich the lead)</span>
        </Label>
        <div className="flex gap-2">
          <Input
            value={form.website}
            onChange={set('website')}
            placeholder="https://restaurant.com"
            className="border-shell bg-white focus-visible:ring-0 focus-visible:border-ink flex-1"
          />
          <Button
            type="button"
            variant="outline"
            className="border-shell shrink-0 gap-1.5"
            disabled={!form.website || enriching}
            onClick={handleEnrich}
          >
            {enriching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            {enriching ? 'Scraping...' : 'Enrich'}
          </Button>
        </div>
        {enrichError && (
          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
            <XCircle className="h-3 w-3" /> {enrichError}
          </p>
        )}
      </div>

      {/* Enrichment preview */}
      {enrichResult && (
        <div className="border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
            <Zap className="h-3 w-3" /> Enriched from website
          </p>
          {enrichResult.companyName && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-3.5 w-3.5 text-ink/40 shrink-0" />
              <span className="font-medium">{enrichResult.companyName}</span>
            </div>
          )}
          {enrichResult.city && (
            <div className="flex items-center gap-2 text-sm text-ink/60">
              <Globe className="h-3.5 w-3.5 text-ink/40 shrink-0" />
              {enrichResult.city}
            </div>
          )}
          {enrichResult.description && (
            <p className="text-xs text-ink/60 leading-relaxed">{enrichResult.description}</p>
          )}
          {enrichResult.phone && (
            <p className="text-xs text-ink/50 font-mono">{enrichResult.phone}</p>
          )}
        </div>
      )}

      {/* Phone */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Phone</Label>
        <Input
          value={form.phone}
          onChange={set('phone')}
          placeholder="+1 (310) 555-0100"
          className="border-shell bg-white focus-visible:ring-0 focus-visible:border-ink"
        />
      </div>

      {submitError && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <AlertCircle className="h-4 w-4" /> {submitError}
        </p>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="bg-ink text-cream hover:bg-ink/80 w-full sm:w-auto px-8 gap-2"
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Adding to Campaign...</>
        ) : (
          <><Zap className="h-4 w-4" /> Add to Campaign</>
        )}
      </Button>
    </form>
  )
}

/* ─── Bulk Import Tab ───────────────────────────────────── */
function BulkImportTab({ onImportComplete }: { onImportComplete: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<BulkResult | null>(null)

  function handleFile(file: File) {
    setParseError('')
    setResult(null)
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      if (parsed.length === 0) {
        setParseError('No valid rows found. Make sure the CSV has headers and at least one data row.')
        setRows([])
      } else {
        setRows(parsed)
      }
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.csv')) handleFile(file)
    else setParseError('Please drop a .csv file')
  }

  async function handleImport() {
    if (rows.length === 0) return
    setImporting(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/leads/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: rows }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Import failed')
      setResult(data)
      setRows([])
      setFileName('')
      onImportComplete()
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const headers = rows.length > 0 ? Object.keys(rows[0]) : []

  if (result) {
    return (
      <div className="space-y-4 max-w-lg">
        <div className="border border-shell p-6 space-y-4">
          <p className="font-serif text-xl font-bold text-ink">Import Complete</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-emerald-50">
              <p className="text-2xl font-bold font-serif text-emerald-700">{result.imported}</p>
              <p className="text-[10px] uppercase tracking-wider text-emerald-600 mt-1">Imported</p>
            </div>
            <div className="text-center p-3 bg-cream">
              <p className="text-2xl font-bold font-serif text-ink/40">{result.skipped}</p>
              <p className="text-[10px] uppercase tracking-wider text-ink/40 mt-1">Skipped</p>
            </div>
            <div className="text-center p-3 bg-red-50">
              <p className="text-2xl font-bold font-serif text-red-600">{result.failed}</p>
              <p className="text-[10px] uppercase tracking-wider text-red-500 mt-1">Failed</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-ink/50 flex items-center gap-1">
                <ChevronDown className="h-3 w-3" /> {result.errors.length} error{result.errors.length !== 1 ? 's' : ''}
              </summary>
              <ul className="mt-2 space-y-1 text-red-600">
                {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </details>
          )}
        </div>
        <Button variant="outline" className="border-shell" onClick={() => setResult(null)}>
          Import Another File
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Format hint */}
      <div className="border border-shell bg-cream p-4">
        <p className="text-xs font-medium text-ink/60 uppercase tracking-wide mb-2">Expected CSV columns</p>
        <code className="text-xs text-ink/70 font-mono">
          first_name, email, company, website
        </code>
        <p className="text-[11px] text-ink/40 mt-2">
          Header names are flexible — "First Name", "Company Name", "Website URL" etc. all work.
          Only <strong>first_name</strong> and <strong>email</strong> are required.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-shell p-10 text-center cursor-pointer hover:border-ink/30 transition-colors"
      >
        <Upload className="h-8 w-8 text-sand mx-auto mb-3" />
        {fileName ? (
          <p className="text-sm font-medium text-ink">{fileName}</p>
        ) : (
          <>
            <p className="text-sm text-ink/60">Drop your CSV here, or click to browse</p>
            <p className="text-xs text-ink/30 mt-1">Up to 500 rows per import</p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {parseError && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <XCircle className="h-4 w-4" /> {parseError}
        </p>
      )}

      {/* Preview table */}
      {rows.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-ink/60">
            <strong className="text-ink">{rows.length} leads</strong> parsed — preview:
          </p>
          <div className="border border-shell overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-shell bg-cream">
                <tr>
                  {headers.slice(0, 5).map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-[10px] font-medium text-ink/50 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-shell">
                {rows.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {headers.slice(0, 5).map((h) => (
                      <td key={h} className="px-3 py-2 text-ink/70 truncate max-w-[160px]">
                        {row[h] || <span className="text-ink/25">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 5 && (
              <p className="px-3 py-2 text-[11px] text-ink/40 border-t border-shell">
                + {rows.length - 5} more rows
              </p>
            )}
          </div>

          <Button
            onClick={handleImport}
            disabled={importing}
            className="bg-ink text-cream hover:bg-ink/80 gap-2"
          >
            {importing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Importing...</>
            ) : (
              <><Upload className="h-4 w-4" /> Import {rows.length} Lead{rows.length !== 1 ? 's' : ''} to Campaign</>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

/* ─── Pipeline Tab ──────────────────────────────────────── */
function PipelineTab({
  leads,
  onStatusChange,
}: {
  leads: Lead[]
  onStatusChange: (id: string, status: LeadStatus) => void
}) {
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'ALL'>('ALL')
  const [addOpen, setAddOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Quick-add form (plain add without campaign push)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', source: 'website', notes: '' })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const filtered = filterStatus === 'ALL' ? leads : leads.filter((l) => l.status === filterStatus)

  function handleStatusChange(leadId: string, newStatus: LeadStatus) {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/leads/${leadId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
        if (res.ok) onStatusChange(leadId, newStatus)
      } catch { /* silent */ }
    })
  }

  async function handleAddLead(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setFormError(data.error || 'Failed'); return }
      setAddOpen(false)
      setForm({ name: '', email: '', phone: '', company: '', source: 'website', notes: '' })
    } catch { setFormError('Network error') } finally { setFormLoading(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(['ALL', ...ALL_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase border transition-colors ${
                filterStatus === s
                  ? 'bg-ink text-cream border-ink'
                  : 'border-shell text-ink/60 hover:border-ink/40'
              }`}
            >
              {s === 'ALL' ? `All (${leads.length})` : s}
            </button>
          ))}
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-ink text-cream hover:bg-ink/80 shrink-0 gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Manually
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-cream border-shell max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-ink">Add to Pipeline</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddLead} className="space-y-4 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Name *</Label>
                  <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" className="border-shell bg-white focus-visible:ring-0 focus-visible:border-ink" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Email *</Label>
                  <Input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@example.com" className="border-shell bg-white focus-visible:ring-0 focus-visible:border-ink" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+1 (310) 555-0100" className="border-shell bg-white focus-visible:ring-0 focus-visible:border-ink" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Company</Label>
                  <Input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Company name" className="border-shell bg-white focus-visible:ring-0 focus-visible:border-ink" />
                </div>
              </div>
              {formError && <p className="text-red-600 text-xs">{formError}</p>}
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1 border-shell" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={formLoading} className="flex-1 bg-ink text-cream hover:bg-ink/80">
                  {formLoading ? 'Adding...' : 'Add'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-shell overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-ink/40 text-sm">
            {filterStatus === 'ALL' ? 'No leads yet.' : `No leads with status "${filterStatus}".`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-shell bg-cream">
                <tr>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-ink/50 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-ink/50 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-ink/50 uppercase tracking-wider hidden lg:table-cell">Company</th>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-ink/50 uppercase tracking-wider hidden lg:table-cell">Website</th>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-ink/50 uppercase tracking-wider">Campaign</th>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-ink/50 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-ink/50 uppercase tracking-wider hidden sm:table-cell">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-shell">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-ink/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-ink">{lead.name}</span>
                      {lead.phone && <p className="text-[11px] text-ink/40 mt-0.5">{lead.phone}</p>}
                    </td>
                    <td className="px-4 py-3 text-ink/70 font-mono text-xs hidden sm:table-cell">{lead.email}</td>
                    <td className="px-4 py-3 text-ink/60 hidden lg:table-cell">
                      {lead.company || <span className="text-ink/25">—</span>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {lead.website ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-ink/50 hover:text-ink transition-colors"
                        >
                          <Globe className="h-3 w-3" />
                          {new URL(lead.website).hostname.replace('www.', '')}
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ) : (
                        <span className="text-ink/25">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <CampaignBadge pushed={!!lead.emailBisonId} />
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={lead.status}
                        onValueChange={(v) => handleStatusChange(lead.id, v as LeadStatus)}
                        disabled={isPending}
                      >
                        <SelectTrigger className="border-0 p-0 h-auto bg-transparent focus:ring-0 w-auto gap-1.5 [&>span]:flex [&>span]:items-center">
                          <SelectValue><StatusBadge status={lead.status} /></SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-cream border-shell">
                          {ALL_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}><StatusBadge status={s} /></SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-ink/40 hidden sm:table-cell whitespace-nowrap">
                      {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Main export ───────────────────────────────────────── */
export function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)

  const handleLeadAdded = useCallback((lead: Lead) => {
    setLeads((prev) => [lead, ...prev])
  }, [])

  const handleStatusChange = useCallback((id: string, status: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
  }, [])

  return (
    <Tabs defaultValue="add" className="space-y-6">
      <TabsList className="border border-shell bg-cream h-auto p-0 gap-0">
        <TabsTrigger
          value="add"
          className="px-5 py-2.5 text-xs font-medium uppercase tracking-wide rounded-none data-[state=active]:bg-ink data-[state=active]:text-cream data-[state=inactive]:text-ink/50 transition-colors gap-1.5"
        >
          <Zap className="h-3.5 w-3.5" /> Add to Campaign
        </TabsTrigger>
        <TabsTrigger
          value="bulk"
          className="px-5 py-2.5 text-xs font-medium uppercase tracking-wide rounded-none data-[state=active]:bg-ink data-[state=active]:text-cream data-[state=inactive]:text-ink/50 transition-colors gap-1.5"
        >
          <Upload className="h-3.5 w-3.5" /> Bulk Import
        </TabsTrigger>
        <TabsTrigger
          value="pipeline"
          className="px-5 py-2.5 text-xs font-medium uppercase tracking-wide rounded-none data-[state=active]:bg-ink data-[state=active]:text-cream data-[state=inactive]:text-ink/50 transition-colors gap-1.5"
        >
          Pipeline ({leads.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="add" className="mt-0">
        <div className="space-y-2 mb-6">
          <h3 className="font-serif text-xl font-bold text-ink">Add Lead to Campaign</h3>
          <p className="text-sm text-ink/50">
            Enter contact details, optionally enrich from their website, then push directly to the EmailBison campaign.
          </p>
        </div>
        <AddLeadTab onLeadAdded={handleLeadAdded} />
      </TabsContent>

      <TabsContent value="bulk" className="mt-0">
        <div className="space-y-2 mb-6">
          <h3 className="font-serif text-xl font-bold text-ink">Bulk Import</h3>
          <p className="text-sm text-ink/50">
            Upload a CSV of leads and push them all to the campaign at once. Up to 500 per batch.
          </p>
        </div>
        <BulkImportTab onImportComplete={() => {}} />
      </TabsContent>

      <TabsContent value="pipeline" className="mt-0">
        <PipelineTab leads={leads} onStatusChange={handleStatusChange} />
      </TabsContent>
    </Tabs>
  )
}
