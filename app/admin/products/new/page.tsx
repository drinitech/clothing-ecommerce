import { prisma } from "@/lib/prisma"
import AdminProductForm from "@/components/admin/admin-product-form"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Admin — New Product" }

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">New Product</h1>
      <AdminProductForm categories={categories} />
    </div>
  )
}
