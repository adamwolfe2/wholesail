'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Pencil, Loader2 } from 'lucide-react'

interface ClientData {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  website: string | null
  paymentTerms: string
  creditLimit: number | null
  isWholesaler: boolean
  isDistributor: boolean
  distributorCcEmail: string | null
  notes: string | null
}

export function EditClientDialog({ client }: { client: ClientData }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: client.name,
    contactPerson: client.contactPerson,
    email: client.email,
    phone: client.phone,
    website: client.website ?? '',
    paymentTerms: client.paymentTerms,
    creditLimit: client.creditLimit != null ? String(client.creditLimit) : '',
    isWholesaler: client.isWholesaler,
    isDistributor: client.isDistributor,
    distributorCcEmail: client.distributorCcEmail ?? '',
    notes: client.notes ?? '',
  })

  function set(key: keyof typeof form, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          contactPerson: form.contactPerson,
          email: form.email,
          phone: form.phone,
          website: form.website,
          paymentTerms: form.paymentTerms,
          creditLimit: form.creditLimit ? Number(form.creditLimit) : null,
          isWholesaler: form.isWholesaler,
          isDistributor: form.isDistributor,
          distributorCcEmail: form.distributorCcEmail || null,
          notes: form.notes,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Failed to save')
        return
      }
      setOpen(false)
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-1.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2 space-y-1.5">
              <Label>Business Name</Label>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Person</Label>
              <Input value={form.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-1.5">
              <Label>Website</Label>
              <Input placeholder="https://..." value={form.website} onChange={(e) => set('website', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Payment Terms</Label>
              <Select value={form.paymentTerms} onValueChange={(v) => set('paymentTerms', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COD">COD</SelectItem>
                  <SelectItem value="Net-15">Net-15</SelectItem>
                  <SelectItem value="Net-30">Net-30</SelectItem>
                  <SelectItem value="Net-45">Net-45</SelectItem>
                  <SelectItem value="Net-60">Net-60</SelectItem>
                  <SelectItem value="Net-90">Net-90</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Credit Limit ($)</Label>
              <Input
                type="number"
                placeholder="None"
                value={form.creditLimit}
                onChange={(e) => set('creditLimit', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 py-1">
            <Switch
              id="wholesaler"
              checked={form.isWholesaler}
              onCheckedChange={(v) => set('isWholesaler', v)}
            />
            <Label htmlFor="wholesaler" className="cursor-pointer">
              Partner / Wholesaler (B2B buyer, has client portal)
            </Label>
          </div>

          <div className="flex items-center gap-3 py-1">
            <Switch
              id="distributor"
              checked={form.isDistributor}
              onCheckedChange={(v) => set('isDistributor', v)}
            />
            <Label htmlFor="distributor" className="cursor-pointer">
              Distributor (fulfillment partner, has fulfillment portal)
            </Label>
          </div>

          {form.isDistributor && (
            <div className="space-y-1.5">
              <Label>Distributor CC Email (optional)</Label>
              <Input
                type="email"
                placeholder="cc@example.com"
                value={form.distributorCcEmail}
                onChange={(e) => set('distributorCcEmail', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Copied on all order notification emails sent to this distributor.</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Internal Notes</Label>
            <Textarea
              placeholder="Notes visible to staff only..."
              rows={3}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
