"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, ShoppingBag, Star, Truck, RotateCcw } from "lucide-react"
import { cn, formatPrice, calculateDiscount } from "@/lib/utils"
import { ProductWithRelations } from "@/types"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import axios from "axios"
import ReviewForm from "@/components/product/review-form"

export default function ProductDetail({ product }: { product: ProductWithRelations }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string>()
  const [selectedColor, setSelectedColor] = useState<string>()
  const [adding, setAdding] = useState(false)
  const { data: session } = useSession()
  const { items, setItems, openCart } = useCart()
  const { toggle, has } = useWishlist()
  const isWishlisted = has(product.id)

  const discount = product.discountPrice
    ? calculateDiscount(Number(product.price), Number(product.discountPrice))
    : 0

  const avgRating = product.reviews.length
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
    : 0

  const handleAddToCart = async () => {
    if (!session) { toast.error("Please login to add to cart"); return }
    if (product.sizes.length > 0 && !selectedSize) { toast.error("Please select a size"); return }
    if (product.colors.length > 0 && !selectedColor) { toast.error("Please select a color"); return }

    setAdding(true)
    try {
      const { data } = await axios.post("/api/cart", {
        productId: product.id,
        quantity: 1,
        size: selectedSize,
        color: selectedColor,
      })
      const existing = items.find((i) => i.id === data.id)
      if (existing) setItems(items.map((i) => (i.id === data.id ? data : i)))
      else setItems([...items, data])
      toast.success("Added to cart")
      openCart()
    } catch {
      toast.error("Failed to add to cart")
    } finally {
      setAdding(false)
    }
  }

  const handleWishlist = async () => {
    if (!session) { toast.error("Please login to save items"); return }
    toggle(product.id)
    try {
      await axios.post("/api/wishlist", { productId: product.id })
      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist")
    } catch {
      toggle(product.id)
      toast.error("Failed to update wishlist")
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
            {product.images[selectedImage] && (
              <Image
                src={product.images[selectedImage].imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            )}
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-base px-3 py-1">
                -{discount}%
              </Badge>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative aspect-square rounded-md overflow-hidden border-2 transition-colors",
                    selectedImage === i ? "border-primary" : "border-transparent"
                  )}
                >
                  <Image src={img.imageUrl} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{product.category.name}</p>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">SKU: {product.sku}</p>
          </div>

          {/* Rating */}
          {product.reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({product.reviews.length} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            {product.discountPrice ? (
              <>
                <span className="text-3xl font-bold">{formatPrice(Number(product.discountPrice))}</span>
                <span className="text-xl text-muted-foreground line-through">{formatPrice(Number(product.price))}</span>
              </>
            ) : (
              <span className="text-3xl font-bold">{formatPrice(Number(product.price))}</span>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Size {selectedSize && `— ${selectedSize}`}</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSize(s.size)}
                    className={cn(
                      "h-10 min-w-[2.5rem] px-3 rounded-md border text-sm font-medium transition-colors",
                      selectedSize === s.size
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:border-primary"
                    )}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Color {selectedColor && `— ${selectedColor}`}</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c.color)}
                    title={c.color}
                    className={cn(
                      "h-9 px-3 rounded-md border text-sm font-medium transition-colors",
                      selectedColor === c.color
                        ? "ring-2 ring-primary ring-offset-2"
                        : "hover:border-primary"
                    )}
                    style={c.hex ? { backgroundColor: c.hex, color: "#fff" } : {}}
                  >
                    {!c.hex && c.color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <div>
            {product.stock > 0 ? (
              <p className="text-sm text-green-600 font-medium">
                {product.stock <= 5 ? `Only ${product.stock} left!` : "In Stock"}
              </p>
            ) : (
              <p className="text-sm text-red-500 font-medium">Out of Stock</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
            <Button size="lg" variant="outline" onClick={handleWishlist}>
              <Heart className={cn("h-5 w-5", isWishlisted && "fill-red-500 text-red-500")} />
            </Button>
          </div>

          <Separator />

          {/* Perks */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Truck className="h-4 w-4" /> Free shipping on orders over $75</div>
            <div className="flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Free returns within 30 days</div>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        {session && <ReviewForm productId={product.id} />}
        <div className="mt-6 space-y-4">
          {product.reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                  {review.user.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{review.user.name}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={cn("h-3 w-3", s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted")} />
                    ))}
                  </div>
                </div>
              </div>
              {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
            </div>
          ))}
          {product.reviews.length === 0 && (
            <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>
    </div>
  )
}
