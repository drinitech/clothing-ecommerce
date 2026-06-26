import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ProductDetail from "@/components/product/product-detail"
import RelatedProducts from "@/components/product/related-products"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug } })
  return product
    ? { title: product.name, description: product.description.slice(0, 160) }
    : { title: "Product Not Found" }
}

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
      sizes: true,
      colors: true,
      reviews: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail product={product as any} />
      <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
    </div>
  )
}
