"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingBag, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn, formatPrice, calculateDiscount } from "@/lib/utils"
import { ProductWithRelations } from "@/types"
import { useWishlist } from "@/hooks/use-wishlist"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import axios from "axios"

interface ProductCardProps {
  product: ProductWithRelations
  className?: string
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const { toggle, has } = useWishlist()
  const { items, setItems, openCart } = useCart()
  const { data: session } = useSession()
  const isWishlisted = has(product.id)

  const avgRating = product.reviews.length
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
    : 0

  const mainImage = product.images[0]?.imageUrl
  const discount = product.discountPrice
    ? calculateDiscount(Number(product.price), Number(product.discountPrice))
    : 0

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!session) { toast.error("Please login to add to wishlist"); return }
    toggle(product.id)
    try {
      await axios.post("/api/wishlist", { productId: product.id })
    } catch {
      toggle(product.id)
      toast.error("Failed to update wishlist")
    }
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!session) { toast.error("Please login to add to cart"); return }
    try {
      const { data } = await axios.post("/api/cart", { productId: product.id, quantity: 1 })
      const existing = items.find((i) => i.id === data.id)
      if (existing) {
        setItems(items.map((i) => (i.id === data.id ? data : i)))
      } else {
        setItems([...items, data])
      }
      toast.success("Added to cart")
      openCart()
    } catch {
      toast.error("Failed to add to cart")
    }
  }

  return (
    <div className={cn("group relative", className)}>
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
          {mainImage ? (
            <Image src={mainImage} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
          )}

          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">-{discount}%</Badge>
          )}
          {product.featured && (
            <Badge className="absolute top-2 right-10 bg-primary">Featured</Badge>
          )}

          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
            <Button size="sm" className="flex-1 text-xs" onClick={handleAddToCart}>
              <ShoppingBag className="h-3 w-3 mr-1" /> Add to Cart
            </Button>
          </div>
        </div>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur"
        onClick={handleWishlist}
      >
        <Heart className={cn("h-4 w-4", isWishlisted && "fill-red-500 text-red-500")} />
      </Button>

      <div className="mt-3 space-y-1">
        <p className="text-xs text-muted-foreground">{product.category.name}</p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium hover:underline line-clamp-1">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product.discountPrice ? (
              <>
                <span className="text-sm font-semibold">{formatPrice(Number(product.discountPrice))}</span>
                <span className="text-xs text-muted-foreground line-through">{formatPrice(Number(product.price))}</span>
              </>
            ) : (
              <span className="text-sm font-semibold">{formatPrice(Number(product.price))}</span>
            )}
          </div>
          {avgRating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs">{avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
