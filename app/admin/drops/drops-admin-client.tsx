'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Eye, EyeOff, Users, Bell, Loader2, Radio } from 'lucide-react'

interface Drop {
  id: string
  title: string
  category: string | null
  dropDate: string
  description: string | null
  isPublic: boolean
  alertCount: number
  quantityTotal: number | null
  quantitySold: number
  priceNote: string | null
  notifiedAt: string | null
  featured: boolean
  productName: string | null
}

export function DropsAdminClient({ initialDrops }: { initialDrops: Drop[] }) {
  const [drops, setDrops] = useState<Drop[]>(initialDrops)
  const [newDropOpen, setNewDropOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [notifyingId, setNotifyingId] = useState<string | null>(null)
  const [blastingId, setBlastingId] = useState<string | null>(null)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    title: '',
    category: '',
    dropDate: '',
    description: '',
    priceNote: '',
    quantityTotal: '',
    isPublic: true,
    featured: false,
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)
    try {
      const res = await fetch('/api/admin/drops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          category: form.category || null,
          dropDate: form.dropDate,
          description: form.description || null,
          priceNote: form.priceNote || null,
          quantityTotal: form.quantityTotal ? parseInt(form.quantityTotal, 10) : null,
          isPublic: form.isPublic,
          featured: form.featured,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error || 'Failed to create drop')
      } else {
        const newDrop: Drop = {
          id: data.drop.id,
          title: data.drop.title,
          category: data.drop.category,
          dropDate: data.drop.dropDate,
          description: data.drop.description,
          isPublic: data.drop.isPublic,
          alertCount: data.drop._count?.alerts ?? 0,
          quantityTotal: data.drop.quantityTotal ?? null,
          quantitySold: data.drop.quantitySold ?? 0,
          priceNote: data.drop.priceNote ?? null,
          notifiedAt: data.drop.notifiedAt ?? null,
          featured: data.drop.featured ?? false,
          productName: data.drop.product?.name ?? null,
        }
        setDrops((prev) =>
          [...prev, newDrop].sort(
            (a, b) => new Date(a.dropDate).getTime() - new Date(b.dropDate).getTime()
          )
        )
        setForm({
          title: '',
          category: '',
          dropDate: '',
          description: '',
          priceNote: '',
          quantityTotal: '',
          isPublic: true,
          featured: false,
        })
        setNewDropOpen(false)
      }
    } catch {
      setFormError('Network error. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleNotify(drop: Drop) {
    if (drop.alertCount === 0) return
    if (
      !confirm(
        `Send alert email to ${drop.alertCount} subscriber${drop.alertCount !== 1 ? 's' : ''}? This cannot be undone.`
      )
    )
      return
    setNotifyingId(drop.id)
    try {
      const res = await fetch(`/api/admin/drops/${drop.id}/notify`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        alert(`Sent ${data.sent} of ${data.total} notifications.`)
      } else {
        alert(data.error || 'Failed to send notifications.')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setNotifyingId(null)
    }
  }

  async function handleBlast(drop: Drop) {
    if (
      !confirm(
        `Send a wholesale blast for "${drop.title}" to all approved wholesale partners? This will send email + SMS. This cannot be undone.`
      )
    )
      return
    setBlastingId(drop.id)
    try {
      const res = await fetch(`/api/admin/drops/${drop.id}/blast`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        alert(
          `Blast sent to ${data.total} partners.\nEmails: ${data.emailsSent}\nSMS: ${data.smsSent}`
        )
        // Update notifiedAt locally
        setDrops((prev) =>
          prev.map((d) =>
            d.id === drop.id ? { ...d, notifiedAt: new Date().toISOString() } : d
          )
        )
      } else {
        alert(data.error || 'Failed to send blast.')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setBlastingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this drop? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/drops/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setDrops((prev) => prev.filter((d) => d.id !== id))
      }
    } catch {
      // silent
    }
  }

  async function handleTogglePublic(drop: Drop) {
    try {
      const res = await fetch(`/api/admin/drops/${drop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !drop.isPublic }),
      })
      if (res.ok) {
        setDrops((prev) =>
          prev.map((d) => (d.id === drop.id ? { ...d, isPublic: !d.isPublic } : d))
        )
      }
    } catch {
      // silent
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={newDropOpen} onOpenChange={setNewDropOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-ink text-cream hover:bg-ink/80">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Drop
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-cream border-shell max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-ink">
                New Product Drop
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-ink/60 uppercase tracking-wide">
                  Title *
                </Label>
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="White Truffle Season Opener"
                  className="border-shell bg-white focus-visible:ring-0 focus-visible:border-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-ink/60 uppercase tracking-wide">
                    Category
                  </Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="TRUFFLES"
                    className="border-shell bg-white focus-visible:ring-0 focus-visible:border-ink"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-ink/60 uppercase tracking-wide">
                    Drop Date *
                  </Label>
                  <Input
                    required
                    type="date"
                    value={form.dropDate}
                    onChange={(e) => setForm((f) => ({ ...f, dropDate: e.target.value }))}
                    className="border-shell bg-white focus-visible:ring-0 focus-visible:border-ink"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-ink/60 uppercase tracking-wide">
                  Price Note
                </Label>
                <Input
                  value={form.priceNote}
                  onChange={(e) => setForm((f) => ({ ...f, priceNote: e.target.value }))}
                  placeholder="Starting at $40/oz or Market rate — contact for pricing"
                  className="border-shell bg-white focus-visible:ring-0 focus-visible:border-ink"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-ink/60 uppercase tracking-wide">
                  Quantity (leave blank for unlimited)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.quantityTotal}
                  onChange={(e) => setForm((f) => ({ ...f, quantityTotal: e.target.value }))}
                  placeholder="e.g. 50"
                  className="border-shell bg-white focus-visible:ring-0 focus-visible:border-ink"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-ink/60 uppercase tracking-wide">
                  Description
                </Label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of this drop..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-shell bg-white text-ink placeholder:text-sand focus:outline-none focus:border-ink transition-colors resize-none"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublic}
                    onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))}
                    className="h-4 w-4 border-shell"
                  />
                  <span className="text-sm text-ink/70">Show on public page</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                    className="h-4 w-4 border-shell"
                  />
                  <span className="text-sm text-ink/70">Featured</span>
                </label>
              </div>

              {formError && <p className="text-red-600 text-xs">{formError}</p>}
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-shell"
                  onClick={() => setNewDropOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-ink text-cream hover:bg-ink/80"
                >
                  {formLoading ? 'Creating...' : 'Create Drop'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-shell overflow-hidden">
        {drops.length === 0 ? (
          <div className="py-16 text-center text-ink/40 text-sm">
            No drops yet. Create the first one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-shell bg-cream">
                <tr>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-ink/50 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-ink/50 uppercase tracking-wider hidden lg:table-cell">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-ink/50 uppercase tracking-wider hidden md:table-cell">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-ink/50 uppercase tracking-wider">
                    Drop Date
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-ink/50 uppercase tracking-wider hidden lg:table-cell">
                    Qty
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-ink/50 uppercase tracking-wider">
                    Visibility
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-ink/50 uppercase tracking-wider hidden sm:table-cell">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Signups
                    </span>
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-ink/50 uppercase tracking-wider hidden xl:table-cell">
                    Blasted
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-ink/50 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-shell">
                {drops.map((drop) => (
                  <tr key={drop.id} className="hover:bg-ink/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{drop.title}</p>
                      {drop.priceNote && (
                        <p className="text-[11px] text-ink/40 mt-0.5 italic">
                          {drop.priceNote}
                        </p>
                      )}
                      {drop.description && (
                        <p className="text-[11px] text-ink/30 mt-0.5 max-w-xs truncate">
                          {drop.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {drop.productName ? (
                        <span className="text-[11px] text-ink/60">{drop.productName}</span>
                      ) : (
                        <span className="text-ink/25">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {drop.category ? (
                        <span className="text-[10px] tracking-wider uppercase text-ink/60 bg-shell px-2 py-0.5">
                          {drop.category}
                        </span>
                      ) : (
                        <span className="text-ink/25">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink/70 whitespace-nowrap">
                      {format(new Date(drop.dropDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {drop.quantityTotal !== null ? (
                        <div className="space-y-1 min-w-[80px]">
                          <p className="font-mono text-xs text-ink">
                            {drop.quantitySold}/{drop.quantityTotal}
                          </p>
                          <div className="h-1 w-16 bg-shell overflow-hidden">
                            <div
                              className="h-full bg-ink"
                              style={{
                                width: `${Math.min(100, Math.round((drop.quantitySold / drop.quantityTotal) * 100))}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-ink/30">Unlimited</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTogglePublic(drop)}
                        className="flex items-center gap-1.5 text-[11px] text-ink/60 hover:text-ink transition-colors"
                        title={drop.isPublic ? 'Click to make private' : 'Click to make public'}
                      >
                        {drop.isPublic ? (
                          <>
                            <Eye className="h-3.5 w-3.5 text-green-600" />
                            <span className="text-green-700">Public</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            <span>Private</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="font-mono text-sm font-medium text-ink">
                        {drop.alertCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      {drop.notifiedAt ? (
                        <span className="text-[11px] text-ink/50">
                          {format(new Date(drop.notifiedAt), 'MMM d, HH:mm')}
                        </span>
                      ) : (
                        <span className="text-ink/25 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* Notify drop subscribers */}
                        <button
                          onClick={() => handleNotify(drop)}
                          disabled={notifyingId === drop.id || drop.alertCount === 0}
                          className="p-1.5 text-ink/30 hover:text-ink transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={
                            drop.alertCount > 0
                              ? `Notify ${drop.alertCount} subscribers`
                              : 'No subscribers'
                          }
                        >
                          {notifyingId === drop.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Bell className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* Wholesale blast */}
                        <button
                          onClick={() => handleBlast(drop)}
                          disabled={blastingId === drop.id}
                          className="p-1.5 text-ink/30 hover:text-blue-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Send wholesale blast (email + SMS to all approved partners)"
                        >
                          {blastingId === drop.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Radio className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(drop.id)}
                          className="p-1.5 text-ink/30 hover:text-red-600 transition-colors"
                          title="Delete drop"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
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
