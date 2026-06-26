import { create } from "zustand"
import { persist } from "zustand/middleware"
import { CartItemWithProduct } from "@/types"

type CartStore = {
  items: CartItemWithProduct[]
  isOpen: boolean
  setItems: (items: CartItemWithProduct[]) => void
  openCart: () => void
  closeCart: () => void
  clearCart: () => void
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      setItems: (items) => set({ items }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      clearCart: () => set({ items: [], isOpen: false }),
    }),
    { name: "cart-store" }
  )
)

export function useCartCount() {
  return useCart((s) => s.items.reduce((acc, item) => acc + item.quantity, 0))
}

export function useCartTotal() {
  return useCart((s) =>
    s.items.reduce((acc, item) => {
      const price = Number(item.product.discountPrice ?? item.product.price)
      return acc + price * item.quantity
    }, 0)
  )
}
