'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { RefreshCw, Loader2, Check } from 'lucide-react'

interface ReorderItem {
  id: string
  name: string
  quantity: number
  unitPrice: string
  product?: {
    slug: string
    unit: string
    category: string
    price: string
  } | null
}

export function ReorderButton({
  orderNumber,
  items,
  variant = 'outline',
  size = 'sm',
}: {
  orderNumber: string
  items?: ReorderItem[]
  variant?: 'outline' | 'default' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
}) {
  const { addItem } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleReorder() {
    setLoading(true)
    try {
      let orderItems = items

      // If items not provided, fetch them
      if (!orderItems) {
        const res = await fetch(`/api/client/orders/${orderNumber}`)
        if (!res.ok) return
        const data = await res.json()
        orderItems = data.order?.items || []
      }

      if (!orderItems || orderItems.length === 0) return

      for (const item of orderItems) {
        addItem({
          id: item.product?.slug || item.id,
          name: item.name,
          price: Number(item.product?.price || item.unitPrice),
          unit: item.product?.unit || 'each',
          category: item.product?.category || 'Other',
          quantity: item.quantity,
        })
      }

      setDone(true)
      setTimeout(() => {
        router.push('/checkout')
      }, 500)
    } catch {
      // Error reordering
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleReorder}
      disabled={loading || done}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-1" />
      ) : done ? (
        <Check className="h-4 w-4 mr-1" />
      ) : (
        <RefreshCw className="h-4 w-4 mr-1" />
      )}
      {done ? 'Added!' : 'Reorder'}
    </Button>
  )
}
