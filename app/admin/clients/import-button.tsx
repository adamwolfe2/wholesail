'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Upload, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'

interface ParsedClient {
  name: string
  phone: string
  contactPerson: string
  email: string
}

interface ImportResult {
  created: number
  updated: number
  errors: string[]
}

function parseCSV(csv: string): { clients: ParsedClient[]; parseErrors: string[] } {
  const lines = csv.trim().split('\n').filter(l => l.trim())
  if (lines.length === 0) return { clients: [], parseErrors: [] }

  const clients: ParsedClient[] = []
  const parseErrors: string[] = []

  // Detect header row (skip if first row looks like a header)
  let startIdx = 0
  const firstLine = lines[0].toLowerCase()
  if (
    firstLine.includes('name') ||
    firstLine.includes('phone') ||
    firstLine.includes('contact')
  ) {
    startIdx = 1
  }

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Basic CSV split (handles quoted fields)
    const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g) ?? line.split(',')
    const clean = (s: string) => s.replace(/^"|"$/g, '').trim()

    const name = clean(cols[0] ?? '')
    const phone = clean(cols[1] ?? '')
    const contactPerson = clean(cols[2] ?? '')
    const email = clean(cols[3] ?? '')

    if (!name) {
      parseErrors.push(`Row ${i + 1}: name is required`)
      continue
    }
    if (!phone) {
      parseErrors.push(`Row ${i + 1}: phone is required for "${name}"`)
      continue
    }

    clients.push({ name, phone, contactPerson, email })
  }

  return { clients, parseErrors }
}

export function ImportClientsButton({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [parseErrors, setParseErrors] = useState<string[]>([])

  const { clients, parseErrors: pe } = parseCSV(csvText)

  function handleClose() {
    setOpen(false)
    setCsvText('')
    setResult(null)
    setParseErrors([])
  }

  async function handleImport() {
    const { clients: parsedClients, parseErrors: errors } = parseCSV(csvText)
    if (errors.length > 0) {
      setParseErrors(errors)
      return
    }
    if (parsedClients.length === 0) return

    setLoading(true)
    setParseErrors([])
    setResult(null)

    try {
      const res = await fetch('/api/admin/clients/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clients: parsedClients }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
        onSuccess?.()
      } else {
        setParseErrors([data.error ?? 'Import failed'])
      }
    } catch {
      setParseErrors(['Network error — import failed'])
    } finally {
      setLoading(false)
    }
  }

  const previewCount = csvText.trim() ? clients.length : 0
  const hasErrors = pe.length > 0

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-1.5 border-shell text-ink hover:bg-ink/[0.04]"
      >
        <Upload className="h-4 w-4" />
        Import CSV
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
        <DialogContent className="sm:max-w-lg bg-cream border-shell">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-ink">Import Clients</DialogTitle>
            <DialogDescription className="text-sm text-ink/50">
              Paste CSV with columns: <code className="text-xs bg-shell px-1">name, phone, contactPerson, email</code>. First row can be a header.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="csv-input" className="text-sm font-medium text-ink">
                CSV Data
              </Label>
              <Textarea
                id="csv-input"
                placeholder={`name,phone,contactPerson,email\nAcme Restaurant,2125551234,John Smith,john@acme.com\nBlue Plate Diner,3105559876,,`}
                value={csvText}
                onChange={e => { setCsvText(e.target.value); setResult(null); setParseErrors([]) }}
                rows={8}
                className="border-sand resize-none font-mono text-xs"
                disabled={loading}
              />
            </div>

            {/* Preview count */}
            {csvText.trim() && !result && (
              <div className={`text-sm flex items-center gap-2 ${hasErrors ? 'text-amber-700' : 'text-ink/60'}`}>
                {hasErrors
                  ? <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                  : null
                }
                {hasErrors
                  ? `${pe.length} row(s) have issues`
                  : previewCount === 0
                    ? 'No valid rows found'
                    : `${previewCount} client${previewCount === 1 ? '' : 's'} ready to import`
                }
              </div>
            )}

            {/* Parse errors */}
            {parseErrors.length > 0 && (
              <div className="border border-amber-200 bg-amber-50 px-3 py-2.5 space-y-1">
                {parseErrors.map((e, i) => (
                  <p key={i} className="text-xs text-amber-700">{e}</p>
                ))}
              </div>
            )}

            {/* Import result */}
            {result && (
              <div className="border border-shell bg-white px-4 py-3 space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-ink">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Import complete
                </div>
                <p className="text-sm text-ink/60">
                  {result.created} created, {result.updated} updated
                </p>
                {result.errors.length > 0 && (
                  <div className="pt-1 space-y-0.5">
                    <p className="text-xs text-amber-700 font-medium">{result.errors.length} row(s) failed:</p>
                    {result.errors.map((e, i) => (
                      <p key={i} className="text-xs text-amber-700">{e}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-shell"
            >
              {result ? 'Close' : 'Cancel'}
            </Button>
            {!result && (
              <Button
                onClick={handleImport}
                disabled={previewCount === 0 || loading || hasErrors}
                className="bg-ink text-cream hover:bg-ink/80"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Importing...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" />Import {previewCount > 0 ? previewCount : ''} Client{previewCount === 1 ? '' : 's'}</>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
