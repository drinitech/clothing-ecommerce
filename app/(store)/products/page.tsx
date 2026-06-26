import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import ProductGrid from "@/components/product/product-grid"
import ProductFilters from "@/components/product/product-filters"
import { Skeleton } from "@/components/ui/skeleton"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "All Products" }

async function getProducts(searchParams: Record<string, string>) {
  const where: Record<string, unknown> = { status: "ACTIVE" }

  if (searchParams.category) {
    where.category = { slug: searchParams.category }
  }
  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
    ]
  }
  if (searchParams.featured === "true") where.featured = true
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {
      ...(searchParams.minPrice && { gte: parseFloat(searchParams.minPrice) }),
      ...(searchParams.maxPrice && { lte: parseFloat(searchParams.maxPrice) }),
    }
  }

  const orderBy =
    searchParams.sortBy === "price_asc"
      ? { price: "asc" as const }
      : searchParams.sortBy === "price_desc"
      ? { price: "desc" as const }
      : { createdAt: "desc" as const }

  const page = parseInt(searchParams.page || "1")
  const limit = 12

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: true,
        images: { orderBy: { order: "asc" } },
        sizes: true,
        colors: true,
        reviews: { select: { rating: true } },
      },
    }),
    prisma.product.count({ where }),
  ])

  return { products, total, page, totalPages: Math.ceil(total / limit) }
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } })
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const { products, total, page, totalPages } = await getProducts(params)
  const categories = await getCategories()

  const title = params.search
    ? `Search results for "${params.search}"`
    : params.category
    ? categories.find((c) => c.slug === params.category)?.name ?? "Products"
    : "All Products"

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-1">{total} products found</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0">
          <ProductFilters categories={categories} currentParams={params} />
        </aside>
        <div className="flex-1">
          <ProductGrid products={products as any} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?${new URLSearchParams({ ...params, page: String(p) })}`}
                  className={`h-9 w-9 flex items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
