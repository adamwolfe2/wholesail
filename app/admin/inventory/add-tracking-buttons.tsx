'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  category: string
}

export function AddTrackingButtons({ products }: { products: Product[] }) {
  const router = useRouter()
  const [adding, setAdding] = useState<string | null>(null)

  async function handleAddTracking(productId: string, productName: string) {
    setAdding(productId)
    try {
      const res = await fetch(`/api/admin/inventory/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantityOnHand: 0, quantityReserved: 0, lowStockThreshold: 5 }),
      })
      if (res.ok) {
        toast.success(`Inventory tracking added for ${productName}`)
        router.refresh()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to add tracking')
      }
    } catch {
      toast.error('Failed to add tracking')
    } finally {
      setAdding(null)
    }
  }

  return (
    <div className="space-y-2">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between py-2 border-b border-[#E5E1DB] last:border-0"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-medium text-[#0A0A0A] truncate">{product.name}</span>
            <Badge variant="outline" className="text-xs border-[#E5E1DB] text-[#0A0A0A]/50 shrink-0">
              {product.category}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={adding === product.id}
            onClick={() => handleAddTracking(product.id, product.name)}
            className="border-[#E5E1DB] text-[#0A0A0A] hover:bg-[#E5E1DB]/50 text-xs shrink-0 ml-3"
          >
            {adding === product.id ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Plus className="h-3 w-3 mr-1" />
            )}
            Add Tracking
          </Button>
        </div>
      ))}
    </div>
  )
}
