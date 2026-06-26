"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function AdminProductActions({ productId, productSlug }: { productId: string; productSlug: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Delete this product?")) return
    try {
      await axios.delete(`/api/products/${productId}`)
      toast.success("Product deleted")
      router.refresh()
    } catch {
      toast.error("Failed to delete product")
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link href={`/admin/products/${productId}/edit`} className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 h-7 text-[0.8rem] font-medium hover:bg-muted transition-colors">Edit</Link>
      <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
    </div>
  )
}
