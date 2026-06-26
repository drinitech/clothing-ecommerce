"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { categorySchema, CategoryInput } from "@/lib/validations"
import { slugify } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Category } from "@prisma/client"
import { Trash2, Pencil } from "lucide-react"

type CategoryWithCount = Category & { _count: { products: number } }

export default function AdminCategoryManager({ categories: initial }: { categories: CategoryWithCount[] }) {
  const router = useRouter()
  const [categories, setCategories] = useState(initial)
  const [editing, setEditing] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
  })

  const onSubmit = async (data: CategoryInput) => {
    setLoading(true)
    try {
      if (editing) {
        const { data: updated } = await axios.put(`/api/categories/${editing}`, data)
        setCategories(categories.map((c) => c.id === editing ? { ...c, ...updated } : c))
        toast.success("Category updated!")
        setEditing(null)
      } else {
        const { data: created } = await axios.post("/api/categories", data)
        setCategories([...categories, { ...created, _count: { products: 0 } }])
        toast.success("Category created!")
      }
      reset()
    } catch {
      toast.error("Failed to save category")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return
    try {
      await axios.delete(`/api/categories/${id}`)
      setCategories(categories.filter((c) => c.id !== id))
      toast.success("Category deleted")
    } catch {
      toast.error("Failed to delete category")
    }
  }

  const startEdit = (cat: CategoryWithCount) => {
    setEditing(cat.id)
    setValue("name", cat.name)
    setValue("slug", cat.slug)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader><CardTitle>{editing ? "Edit Category" : "New Category"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input {...register("name")} placeholder="Category name" className="mt-1"
                onChange={(e) => { register("name").onChange(e); setValue("slug", slugify(e.target.value)) }}
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Slug</Label>
              <Input {...register("slug")} placeholder="category-slug" className="mt-1" />
              {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>{editing ? "Update" : "Create"}</Button>
              {editing && <Button type="button" variant="outline" onClick={() => { setEditing(null); reset() }}>Cancel</Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Categories</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">{cat._count.products} products · /{cat.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(cat)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(cat.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
