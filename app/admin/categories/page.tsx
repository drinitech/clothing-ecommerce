import { prisma } from "@/lib/prisma"
import AdminCategoryManager from "@/components/admin/admin-category-manager"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Admin — Categories" }

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Categories</h1>
      <AdminCategoryManager categories={categories as any} />
    </div>
  )
}
