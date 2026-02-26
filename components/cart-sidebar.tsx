'use client'

import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'

export function CartSidebar() {
  const { items, updateQuantity, removeItem, getTotalItems, getTotalPrice } = useCart()

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 h-screen overflow-hidden" aria-describedby={undefined}>
        <SheetHeader className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b">
          <SheetTitle className="text-xl">Your Order ({totalItems} {totalItems === 1 ? 'item' : 'items'})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center px-5 sm:px-6">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mt-1">Add products to get started</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 min-h-0 py-4">
              <div className="space-y-6 px-5 sm:px-6">
                {items.map(item => (
                  <div key={item.id} className="space-y-3 pb-6 border-b last:border-0">
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base leading-tight mb-1 text-pretty">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                        <p className="text-sm font-medium mt-1">
                          ${item.price.toFixed(2)} {item.unit}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-base font-semibold w-10 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-lg font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t px-5 sm:px-6 py-5 sm:py-6 space-y-4 mt-auto">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">Total</span>
                <span className="text-2xl font-bold">${totalPrice.toFixed(2)}</span>
              </div>
              <Button asChild className="w-full h-12 text-base" size="lg">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
