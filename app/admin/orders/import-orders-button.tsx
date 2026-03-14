'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, Loader2, CheckCircle2, AlertTriangle, Download, FileText } from 'lucide-react'

interface Org {
  id: string
  name: string
}

interface ParsedItem {
  sku: string
  quantity: number
}

interface ImportResult {
  orderId: string
  orderNumber: string
  itemCount: number
  total: number
}

function parseCSVPreview(text: string): { items: ParsedItem[]; errors: string[] } {
  const lines = text.trim().split('\n').filter((l) => l.trim())
  if (lines.length === 0) return { items: [], errors: [] }

  let startIdx = 0
  const firstLine = lines[0].toLowerCase()
  if (firstLine.includes('product_sku') || firstLine.includes('quantity')) {
    startIdx = 1
  }

  const items: ParsedItem[] = []
  const errors: string[] = []

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim())
    const sku = cols[0] ?? ''
    const qtyStr = cols[1] ?? ''

    if (!sku) {
      errors.push(`Row ${i + 1}: product_sku is required`)
      continue
    }

    const quantity = parseInt(qtyStr, 10)
    if (!Number.isFinite(quantity) || quantity < 1) {
      errors.push(`Row ${i + 1}: quantity must be a positive integer`)
      continue
    }

    items.push({ sku, quantity })
  }

  return { items, errors }
}

function downloadTemplate() {
  const csv = 'product_sku,quantity\nexample-product-slug,5\nanother-product,10\n'
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'order-import-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function ImportOrdersButton({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [selectedOrgId, setSelectedOrgId] = useState('')
  const [orgs, setOrgs] = useState<Org[]>([])
  const [orgsLoading, setOrgsLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchOrgs = useCallback(async () => {
    setOrgsLoading(true)
    try {
      const res = await fetch('/api/admin/orgs?take=500')
      const data = await res.json()
      setOrgs(data.orgs ?? [])
    } catch {
      setOrgs([])
    } finally {
      setOrgsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open && orgs.length === 0) {
      fetchOrgs()
    }
  }, [open, orgs.length, fetchOrgs])

  const { items: previewItems, errors: previewErrors } = csvText.trim()
    ? parseCSVPreview(csvText)
    : { items: [], errors: [] }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCsvText((ev.target?.result as string) ?? '')
      setResult(null)
      setErrors([])
    }
    reader.readAsText(file)
  }

  function handleClose() {
    setOpen(false)
    setCsvText('')
    setSelectedOrgId('')
    setResult(null)
    setErrors([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleImport() {
    if (!selectedOrgId || previewItems.length === 0) return
    if (previewErrors.length > 0) {
      setErrors(previewErrors)
      return
    }

    setLoading(true)
    setErrors([])
    setResult(null)

    try {
      const blob = new Blob([csvText], { type: 'text/csv' })
      const formData = new FormData()
      formData.append('file', blob, 'import.csv')
      formData.append('organizationId', selectedOrgId)

      const res = await fetch('/api/admin/orders/import', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (res.ok) {
        setResult(data)
        onSuccess?.()
      } else {
        const details = data.details ?? []
        setErrors(details.length > 0 ? details : [data.error ?? 'Import failed'])
      }
    } catch {
      setErrors(['Network error — import failed'])
    } finally {
      setLoading(false)
    }
  }

  const ready = csvText.trim() && selectedOrgId && previewItems.length > 0 && previewErrors.length === 0

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-1.5 rounded-none border-[#E5E1DB] text-[#0A0A0A] hover:bg-[#0A0A0A]/[0.04]"
      >
        <Upload className="h-4 w-4" />
        Import CSV
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
        <DialogContent className="sm:max-w-lg bg-[#F9F7F4] border-[#E5E1DB] rounded-none">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-[#0A0A0A]">Import Order from CSV</DialogTitle>
            <DialogDescription className="text-sm text-[#0A0A0A]/50">
              Upload a CSV with columns: <code className="text-xs bg-[#E5E1DB] px-1 rounded-none">product_sku,quantity</code>. All items will be combined into a single order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Download template */}
            <button
              type="button"
              onClick={downloadTemplate}
              className="inline-flex items-center gap-1.5 text-sm text-[#0A0A0A]/60 hover:text-[#0A0A0A] underline underline-offset-2"
            >
              <Download className="h-3.5 w-3.5" />
              Download CSV template
            </button>

            {/* Organization selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#0A0A0A]">Client Organization</Label>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId} disabled={orgsLoading}>
                <SelectTrigger className="border-[#C8C0B4] rounded-none">
                  <SelectValue placeholder={orgsLoading ? 'Loading...' : 'Select organization'} />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  {orgs.map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#0A0A0A]">CSV File</Label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="gap-1.5 rounded-none border-[#C8C0B4]"
                >
                  <FileText className="h-4 w-4" />
                  Choose File
                </Button>
                {csvText.trim() && (
                  <span className="text-sm text-[#0A0A0A]/60">
                    {previewItems.length} item{previewItems.length !== 1 ? 's' : ''} parsed
                  </span>
                )}
              </div>
            </div>

            {/* Preview table */}
            {previewItems.length > 0 && !result && (
              <div className="border border-[#E5E1DB] bg-white max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F9F7F4] sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-1.5 text-[#0A0A0A]/60 font-medium">SKU</th>
                      <th className="text-right px-3 py-1.5 text-[#0A0A0A]/60 font-medium">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewItems.map((item, i) => (
                      <tr key={i} className="border-t border-[#E5E1DB]">
                        <td className="px-3 py-1.5 font-mono text-xs">{item.sku}</td>
                        <td className="px-3 py-1.5 text-right">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Preview errors */}
            {previewErrors.length > 0 && (
              <div className="border border-amber-200 bg-amber-50 px-3 py-2.5 space-y-1 rounded-none">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {previewErrors.length} row(s) have issues
                </div>
                {previewErrors.map((e, i) => (
                  <p key={i} className="text-xs text-amber-700">{e}</p>
                ))}
              </div>
            )}

            {/* API errors */}
            {errors.length > 0 && (
              <div className="border border-red-200 bg-red-50 px-3 py-2.5 space-y-1 rounded-none">
                {errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-700">{e}</p>
                ))}
              </div>
            )}

            {/* Success result */}
            {result && (
              <div className="border border-[#E5E1DB] bg-white px-4 py-3 space-y-1 rounded-none">
                <div className="flex items-center gap-2 text-sm font-medium text-[#0A0A0A]">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Order created successfully
                </div>
                <p className="text-sm text-[#0A0A0A]/60">
                  Order <span className="font-mono font-medium">{result.orderNumber}</span> with {result.itemCount} item{result.itemCount !== 1 ? 's' : ''} — ${result.total.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-[#E5E1DB] rounded-none"
            >
              {result ? 'Close' : 'Cancel'}
            </Button>
            {!result && (
              <Button
                onClick={handleImport}
                disabled={!ready || loading}
                className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Importing...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" />Import Order</>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
