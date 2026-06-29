"use client"

import React, { useEffect, useRef } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart, useCartTotal } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import axios, { AxiosError } from "axios"
import { useSession } from "next-auth/react"

export default function CartDrawer({ children }: { children: React.ReactNode }) {
  const { items, isOpen, openCart, closeCart, setItems, clearCart } = useCart()
  const total = useCartTotal()
  const { data: session } = useSession()
  const mutatingRef = useRef(false)

  // Sync cart from DB when drawer opens — skip if a mutation is in flight to avoid overwriting optimistic updates
  useEffect(() => {
    if (!isOpen || !session?.user?.id) return
    axios.get("/api/cart")
      .then(({ data }) => {
        if (Array.isArray(data) && !mutatingRef.current) setItems(data)
      })
      .catch(() => {})
  }, [isOpen, session?.user?.id])

  const updateQuantity = async (itemId: string, quantity: number) => {
    const prev = items
    mutatingRef.current = true
    // Optimistically update local state first
    if (quantity <= 0) {
      setItems(items.filter((i) => i.id !== itemId))
    } else {
      setItems(items.map((i) => (i.id === itemId ? { ...i, quantity } : i)))
    }
    try {
      await axios.patch("/api/cart", { itemId, quantity })
    } catch (err) {
      setItems(prev)
      const status = (err as AxiosError)?.response?.status
      if (status === 401) {
        toast.error("Please login to update your cart")
      } else {
        toast.error("Failed to update cart")
      }
    } finally {
      mutatingRef.current = false
    }
  }

  const removeItem = async (itemId: string) => {
    const prev = items
    mutatingRef.current = true
    setItems(items.filter((i) => i.id !== itemId))
    try {
      await axios.delete("/api/cart", { data: { itemId } })
      toast.success("Item removed from cart")
    } catch (err) {
      setItems(prev)
      const status = (err as AxiosError)?.response?.status
      if (status === 401) {
        toast.error("Please login to update your cart")
      } else {
        toast.error("Failed to remove item")
      }
    } finally {
      mutatingRef.current = false
    }
  }

  const trigger = React.cloneElement(React.Children.only(children) as React.ReactElement<any>, {
    onClick: openCart,
  })

  return (
    <>
      {trigger}
      <Sheet open={isOpen} onOpenChange={(open) => (open ? openCart() : closeCart())}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Shopping Cart ({items.length})
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <ShoppingBag className="h-16 w-16 opacity-20" />
              <p className="text-lg">Your cart is empty</p>
              <Link href="/products" onClick={closeCart} className="inline-flex items-center justify-center h-8 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 text-sm font-medium transition-colors">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {items.map((item) => {
                  const img = item.product.images[0]?.imageUrl
                  const price = Number(item.product.discountPrice ?? item.product.price)
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-20 w-16 rounded-md overflow-hidden bg-muted shrink-0">
                        {img && <Image src={img} alt={item.product.name} fill className="object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        {item.size && <p className="text-xs text-muted-foreground">Size: {item.size}</p>}
                        {item.color && <p className="text-xs text-muted-foreground">Color: {item.color}</p>}
                        <p className="text-sm font-semibold mt-1">{formatPrice(price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto text-destructive" onClick={() => removeItem(item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="pt-4 border-t space-y-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                {session ? (
                  <Link href="/checkout" onClick={closeCart} className="flex items-center justify-center w-full h-9 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 font-medium text-sm transition-colors">
                    Proceed to Checkout
                  </Link>
                ) : (
                  <Link href="/auth/login?callbackUrl=/checkout" onClick={closeCart} className="flex items-center justify-center w-full h-9 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 font-medium text-sm transition-colors">
                    Login to Checkout
                  </Link>
                )}
                <Link href="/products" onClick={closeCart} className="flex items-center justify-center w-full h-8 px-4 rounded-lg border border-border bg-background hover:bg-muted font-medium text-sm transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
