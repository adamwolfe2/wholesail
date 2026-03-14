'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useCart } from '@/lib/cart-context'
import { PortalLayout } from '@/components/portal-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Bookmark, ShoppingCart, Trash2, Loader2, Save, Pencil } from 'lucide-react'

interface SavedCartItem {
  id: string
  name: string
  quantity: number
  unitPrice: string
  product: {
    slug: string
    unit: string
    category: string
    price: string
  } | null
}

interface SavedCart {
  id: string
  name: string | null
  updatedAt: string
  items: SavedCartItem[]
}

export default function SavedCartsPage() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const { items: cartItems, addItem, clearCart } = useCart()

  const [carts, setCarts] = useState<SavedCart[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saving, setSaving] = useState(false)
  const [renameTarget, setRenameTarget] = useState<SavedCart | null>(null)
  const [renameName, setRenameName] = useState('')
  const [renaming, setRenaming] = useState(false)

  const fetchCarts = useCallback(async () => {
    try {
      const res = await fetch('/api/client/saved-carts')
      if (res.ok) {
        const data = await res.json()
        setCarts(data.carts || [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchCarts()
    } else if (isLoaded) {
      setLoading(false)
    }
  }, [isLoaded, isSignedIn, fetchCarts])

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/client/saved-carts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCarts((prev) => prev.filter((c) => c.id !== id))
      }
    } catch {
      // silently fail
    } finally {
      setDeletingId(null)
    }
  }

  function handleLoadToCart(cart: SavedCart) {
    setLoadingId(cart.id)
    clearCart()
    for (const item of cart.items) {
      addItem({
        id: item.product?.slug || item.id,
        name: item.name,
        price: Number(item.product?.price ?? item.unitPrice),
        unit: item.product?.unit ?? 'each',
        category: item.product?.category ?? 'Other',
        quantity: item.quantity,
      })
    }
    setTimeout(() => {
      router.push('/client-portal/catalog')
    }, 300)
  }

  async function handleSaveCurrentCart() {
    if (cartItems.length === 0) return
    setSaving(true)
    try {
      const res = await fetch('/api/client/saved-carts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveName || undefined,
          items: cartItems.map((item) => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        }),
      })
      if (res.ok) {
        setSaveDialogOpen(false)
        setSaveName('')
        await fetchCarts()
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  async function handleRename() {
    if (!renameTarget || !renameName.trim()) return
    setRenaming(true)
    try {
      const res = await fetch(`/api/client/saved-carts/${renameTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renameName.trim() }),
      })
      if (res.ok) {
        setCarts((prev) =>
          prev.map((c) => (c.id === renameTarget.id ? { ...c, name: renameName.trim() } : c))
        )
        setRenameTarget(null)
        setRenameName('')
      }
    } catch {
      // silently fail
    } finally {
      setRenaming(false)
    }
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A]">Saved Carts</h1>
            <p className="text-sm text-[#0A0A0A]/50 mt-1">
              Save and reload your frequently ordered combinations
            </p>
          </div>
          {cartItems.length > 0 && (
            <Button
              onClick={() => setSaveDialogOpen(true)}
              className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 min-h-[44px] w-full sm:w-auto rounded-none"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Current Cart ({cartItems.length} items)
            </Button>
          )}
        </div>

        <Card className="border-[#C8C0B4] bg-[#F9F7F4] rounded-none">
          <CardHeader className="border-b border-[#C8C0B4]/50">
            <CardTitle className="font-serif text-lg text-[#0A0A0A]">Your Saved Carts</CardTitle>
            <CardDescription className="text-[#0A0A0A]/50">
              Load a cart to add its items to your current order
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#C8C0B4]" />
              </div>
            ) : !isSignedIn ? (
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 text-[#C8C0B4] mx-auto mb-4" />
                <p className="text-[#0A0A0A]/50 text-sm">Sign in to view your saved carts.</p>
              </div>
            ) : carts.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="h-12 w-12 text-[#C8C0B4] mx-auto mb-4" />
                <h3 className="font-serif text-lg font-medium mb-2 text-[#0A0A0A]">No saved carts</h3>
                <p className="text-[#0A0A0A]/50 text-sm">
                  Build a cart in the marketplace and save it for quick reordering.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {carts.map((cart) => {
                  const totalValue = cart.items.reduce(
                    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
                    0
                  )
                  return (
                    <div
                      key={cart.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-[#C8C0B4]/50 hover:border-[#C8C0B4] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#0A0A0A]">
                          {cart.name || 'Untitled Cart'}
                        </p>
                        <p className="text-xs text-[#0A0A0A]/50 mt-0.5">
                          {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} &bull; ${totalValue.toFixed(2)} estimated &bull; Updated {new Date(cart.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-[#0A0A0A]/40 mt-1 truncate">
                          {cart.items.map((i) => i.name).join(', ')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none min-h-[36px]"
                          onClick={() => handleLoadToCart(cart)}
                          disabled={loadingId === cart.id}
                        >
                          {loadingId === cart.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <ShoppingCart className="h-4 w-4 mr-1" />
                          )}
                          Load to Cart
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#C8C0B4] text-[#0A0A0A]/60 hover:text-[#0A0A0A] hover:bg-[#C8C0B4]/20 rounded-none min-h-[36px] px-2"
                          onClick={() => { setRenameTarget(cart); setRenameName(cart.name || '') }}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Rename</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#C8C0B4] text-[#0A0A0A]/60 hover:text-[#0A0A0A] hover:bg-[#C8C0B4]/20 rounded-none min-h-[36px] px-2"
                          onClick={() => handleDelete(cart.id)}
                          disabled={deletingId === cart.id}
                        >
                          {deletingId === cart.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rename Cart Dialog */}
      <Dialog open={!!renameTarget} onOpenChange={(open) => { if (!open) { setRenameTarget(null); setRenameName('') } }}>
        <DialogContent className="rounded-none border-[#C8C0B4] bg-[#F9F7F4]">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#0A0A0A]">Rename Cart</DialogTitle>
            <DialogDescription className="text-[#0A0A0A]/50">
              Enter a new name for this saved cart.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="renameName" className="text-[#0A0A0A] text-sm">Cart Name</Label>
              <Input
                id="renameName"
                placeholder="e.g. Weekly Truffle Order"
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRename() }}
                className="border-[#C8C0B4] bg-[#F9F7F4] focus-visible:ring-[#0A0A0A] rounded-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setRenameTarget(null); setRenameName('') }}
              className="border-[#C8C0B4] text-[#0A0A0A] hover:bg-[#C8C0B4]/20 rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={renaming || !renameName.trim()}
              className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none"
            >
              {renaming ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Cart Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="rounded-none border-[#C8C0B4] bg-[#F9F7F4]">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#0A0A0A]">Save Current Cart</DialogTitle>
            <DialogDescription className="text-[#0A0A0A]/50">
              Give your cart a name to find it easily later. ({cartItems.length} items)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cartName" className="text-[#0A0A0A] text-sm">Cart Name (optional)</Label>
              <Input
                id="cartName"
                placeholder="e.g. Weekly Truffle Order"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="border-[#C8C0B4] bg-[#F9F7F4] focus-visible:ring-[#0A0A0A] rounded-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
              className="border-[#C8C0B4] text-[#0A0A0A] hover:bg-[#C8C0B4]/20 rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCurrentCart}
              disabled={saving}
              className="bg-[#0A0A0A] text-[#F9F7F4] hover:bg-[#0A0A0A]/80 rounded-none"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Save Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  )
}
