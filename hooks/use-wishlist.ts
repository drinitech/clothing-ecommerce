import { create } from "zustand"
import { persist } from "zustand/middleware"

type WishlistStore = {
  productIds: string[]
  toggle: (id: string) => void
  has: (id: string) => boolean
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (id) =>
        set((s) => ({
          productIds: s.productIds.includes(id)
            ? s.productIds.filter((p) => p !== id)
            : [...s.productIds, id],
        })),
      has: (id) => get().productIds.includes(id),
    }),
    { name: "wishlist-store" }
  )
)
