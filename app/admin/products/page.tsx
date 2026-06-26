import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import AdminProductActions from "@/components/admin/admin-product-actions"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Admin — Products" }

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, images: { orderBy: { order: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">+ Add Product</Link>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 text-left font-medium">Product</th>
              <th className="p-4 text-left font-medium">Category</th>
              <th className="p-4 text-left font-medium">Price</th>
              <th className="p-4 text-left font-medium">Stock</th>
              <th className="p-4 text-left font-medium">Status</th>
              <th className="p-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-muted/30">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-8 rounded bg-muted overflow-hidden shrink-0">
                      {product.images[0] && (
                        <Image src={product.images[0].imageUrl} alt={product.name} fill className="object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{product.category.name}</td>
                <td className="p-4 font-medium">{formatPrice(Number(product.price))}</td>
                <td className="p-4">{product.stock}</td>
                <td className="p-4">
                  <Badge variant={product.status === "ACTIVE" ? "default" : "secondary"}>{product.status}</Badge>
                </td>
                <td className="p-4 text-right">
                  <AdminProductActions productId={product.id} productSlug={product.slug} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
