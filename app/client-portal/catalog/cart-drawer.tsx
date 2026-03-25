'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Loader2,
  Save,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react'

export function CartDrawer() {
  const router = useRouter()
  const {
    items,
    updateQuantity,
    removeItem,
    getTotalItems,
    getTotalPrice,
    clearCart,
  } = useCart()

  const [isOpen, setIsOpen] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [placing, setPlacing] = useState(false)

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  async function handleSaveCart() {
    if (items.length === 0) return
    setSaving(true)
    try {
      const res = await fetch('/api/client/saved-carts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveName || undefined,
          items: items.map((item) => ({
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
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false)
    }
  }

  function handleProceedToCheckout() {
    setPlacing(true)
    setIsOpen(false)
    router.push('/checkout')
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            className="bg-ink text-cream hover:bg-ink/80 rounded-none min-h-[44px] relative"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart
            {totalItems > 0 && (
              <Badge className="ml-2 bg-cream text-ink hover:bg-cream rounded-none h-5 min-w-[20px] px-1 flex items-center justify-center text-xs">
                {totalItems}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent
          className="w-full sm:max-w-lg flex flex-col p-0 h-screen overflow-hidden rounded-none border-l border-sand bg-cream"
          aria-describedby={undefined}
        >
          <SheetHeader className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-sand">
            <SheetTitle className="font-serif text-xl text-ink">
              Your Order ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center px-5 sm:px-6">
              <ShoppingBag className="h-16 w-16 text-sand mb-4" />
              <p className="text-lg font-serif font-medium text-ink/60">
                Your cart is empty
              </p>
              <p className="text-sm text-ink/40 mt-1">
                Add products from the catalog to get started
              </p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 min-h-0 py-4">
                <div className="space-y-0 px-5 sm:px-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="py-4 border-b border-sand/30 last:border-0"
                    >
                      <div className="flex gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] tracking-[0.18em] uppercase text-sand mb-0.5">
                            {item.category}
                          </p>
                          <h4 className="font-serif font-semibold text-sm leading-tight text-ink text-pretty">
                            {item.name}
                          </h4>
                          <p className="text-xs text-ink/50 mt-0.5">
                            {formatCurrency(item.price)} {item.unit}
                          </p>
                        </div>
                        <button
                          className="h-8 w-8 shrink-0 flex items-center justify-center text-sand hover:text-ink transition-colors"
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="h-8 w-8 border border-sand flex items-center justify-center text-ink hover:bg-ink hover:text-cream transition-colors"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-semibold w-8 text-center text-ink">
                            {item.quantity}
                          </span>
                          <button
                            className="h-8 w-8 border border-sand flex items-center justify-center text-ink hover:bg-ink hover:text-cream transition-colors"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-base font-bold text-ink">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="border-t border-sand px-5 sm:px-6 py-5 sm:py-6 space-y-4 mt-auto bg-cream">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-lg font-bold text-ink">
                    Subtotal
                  </span>
                  <span className="font-serif text-2xl font-bold text-ink">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
                <p className="text-xs text-ink/40">
                  {totalPrice >= 500
                    ? 'Free delivery included'
                    : `${formatCurrency(500 - totalPrice)} more for free delivery`}
                </p>

                {/* Save Cart */}
                <Button
                  variant="outline"
                  className="w-full rounded-none border-sand text-ink hover:bg-sand/20 min-h-[44px]"
                  onClick={() => setSaveDialogOpen(true)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Cart for Later
                </Button>

                {/* Proceed to Checkout */}
                <Button
                  className="w-full bg-ink text-cream hover:bg-ink/80 rounded-none min-h-[48px] text-base"
                  onClick={handleProceedToCheckout}
                  disabled={placing}
                >
                  {placing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Proceed to Checkout
                </Button>

                {/* Clear cart */}
                <button
                  className="w-full text-center text-xs text-ink/40 hover:text-ink underline underline-offset-2 transition-colors"
                  onClick={clearCart}
                >
                  Clear cart
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Save success toast-like notification */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-cream text-sm px-4 py-3 shadow-lg animate-fade-in">
          Cart saved successfully
        </div>
      )}

      {/* Save Cart Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="rounded-none border-sand bg-cream">
          <DialogHeader>
            <DialogTitle className="font-serif text-ink">
              Save Cart
            </DialogTitle>
            <DialogDescription className="text-ink/50">
              Save your current cart ({totalItems} items) for quick reordering
              later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="saveCartName" className="text-ink text-sm">
                Cart Name (optional)
              </Label>
              <Input
                id="saveCartName"
                placeholder="e.g. Weekly Order"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveCart()
                }}
                className="border-sand bg-cream focus-visible:ring-ink rounded-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
              className="border-sand text-ink hover:bg-sand/20 rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCart}
              disabled={saving}
              className="bg-ink text-cream hover:bg-ink/80 rounded-none"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Save Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
