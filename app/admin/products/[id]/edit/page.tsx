import { prisma } from "@/lib/prisma"
import AdminProductForm from "@/components/admin/admin-product-form"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Admin — Edit Product" }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: true, sizes: true, colors: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ])

  if (!product) notFound()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>
      <AdminProductForm categories={categories} product={product as any} />
    </div>
  )
}
