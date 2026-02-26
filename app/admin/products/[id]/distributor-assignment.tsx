'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Truck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

interface Distributor {
  id: string
  name: string
  email: string
}

interface DistributorAssignmentProps {
  productId: string
  currentDistributorId: string | null
  distributors: Distributor[]
}

export function DistributorAssignment({
  productId,
  currentDistributorId,
  distributors,
}: DistributorAssignmentProps) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string>(currentDistributorId ?? 'none')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isDirty = selectedId !== (currentDistributorId ?? 'none')

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distributorOrgId: selectedId === 'none' ? null : selectedId }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Select value={selectedId} onValueChange={setSelectedId}>
        <SelectTrigger className="w-64 rounded-none border-[#E5E1DB] text-sm">
          <SelectValue placeholder="No distributor assigned" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No distributor</SelectItem>
          {distributors.map(d => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={save}
        disabled={!isDirty || saving}
        className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none"
        size="sm"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? 'Saved ✓' : 'Save'}
      </Button>
    </div>
  )
}

export function DistributorAssignmentCard(props: DistributorAssignmentProps & { currentDistributorName?: string | null }) {
  return (
    <div className="border border-[#E5E1DB] bg-[#F9F7F4] p-5">
      <div className="flex items-center gap-2 mb-3">
        <Truck className="h-4 w-4 text-[#C8C0B4]" />
        <h3 className="font-medium text-sm text-[#0A0A0A]">Distributor Assignment</h3>
      </div>
      <p className="text-xs text-[#0A0A0A]/50 mb-4">
        Assign a distribution partner who supplies this product. When this product is ordered,
        that distributor will be automatically notified and it will appear in their fulfillment queue.
        {props.currentDistributorName && (
          <span className="block mt-1 font-medium text-[#0A0A0A]/70">
            Currently assigned to: {props.currentDistributorName}
          </span>
        )}
      </p>
      <DistributorAssignment
        productId={props.productId}
        currentDistributorId={props.currentDistributorId}
        distributors={props.distributors}
      />
    </div>
  )
}
