import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProductGrid from "@/components/product/product-grid"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "My Wishlist" }

export default async function WishlistPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          category: true,
          images: { orderBy: { order: "asc" } },
          sizes: true,
          colors: true,
          reviews: { select: { rating: true } },
        },
      },
    },
  })

  const products = wishlistItems.map((item) => item.product)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <p className="text-muted-foreground mt-1">{products.length} saved items</p>
      </div>
      <ProductGrid products={products as any} />
    </div>
  )
}
