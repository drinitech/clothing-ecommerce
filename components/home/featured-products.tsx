import { prisma } from "@/lib/prisma"
import ProductGrid from "@/components/product/product-grid"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { featured: true, status: "ACTIVE" },
    take: 8,
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
      sizes: true,
      colors: true,
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  if (products.length === 0) return null

  return (
    <section className="py-16 container mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <p className="text-muted-foreground mt-1">Handpicked just for you</p>
        </div>
        <Link href="/products?featured=true" className="inline-flex items-center text-sm font-medium hover:text-primary transition-colors">
          View all <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
      <ProductGrid products={products as any} />
    </section>
  )
}
