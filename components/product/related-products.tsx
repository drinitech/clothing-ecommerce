import { prisma } from "@/lib/prisma"
import ProductGrid from "./product-grid"
import { serializeProduct } from "@/lib/utils"

export default async function RelatedProducts({
  categoryId,
  currentProductId,
}: {
  categoryId: string
  currentProductId: string
}) {
  const raw = await prisma.product.findMany({
    where: { categoryId, id: { not: currentProductId }, status: "ACTIVE" },
    take: 4,
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
      sizes: true,
      colors: true,
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  const products = raw.map(serializeProduct)

  if (products.length === 0) return null

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
      <ProductGrid products={products as any} />
    </div>
  )
}
