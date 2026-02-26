'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface Props {
  orderId: string
  currentDistributorOrgId: string | null
  distributors: { id: string; name: string }[]
}

export function AssignDistributor({ orderId, currentDistributorOrgId, distributors }: Props) {
  const [selected, setSelected] = useState<string>(currentDistributorOrgId ?? 'none')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isDirty = selected !== (currentDistributorOrgId ?? 'none')

  async function save() {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/assign-distributor`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distributorOrgId: selected === 'none' ? null : selected }),
      })
      if (res.ok) setSaved(true)
      else alert('Failed to save. Please try again.')
    } catch {
      alert('Network error.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Select value={selected} onValueChange={v => { setSelected(v); setSaved(false) }}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Assign distributor…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">— None —</SelectItem>
          {distributors.map(d => (
            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        disabled={!isDirty || saving}
        onClick={save}
        className="h-9"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
        Save
      </Button>
      {saved && !isDirty && (
        <span className="text-xs text-emerald-600 font-medium">Saved</span>
      )}
    </div>
  )
}
