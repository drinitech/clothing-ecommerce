"use client"

import { useState, useRef } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { productSchema, ProductInput } from "@/lib/validations"
import { slugify, generateSKU } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Category, Product, ProductImage, ProductSize, ProductColor } from "@prisma/client"
import { X, Plus, Upload } from "lucide-react"

type ProductWithRelations = Product & { images: ProductImage[]; sizes: ProductSize[]; colors: ProductColor[] }

interface AdminProductFormProps {
  categories: Category[]
  product?: ProductWithRelations
}

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42", "One Size"]

export default function AdminProductForm({ categories, product }: AdminProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>(product?.images.map((i) => i.imageUrl) || [])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const formData = new FormData()
      files.forEach((f) => formData.append("files", f))
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const next = [...images, ...data.urls]
      setImages(next)
      setValue("images", next)
      toast.success(`${data.urls.length} image${data.urls.length > 1 ? "s" : ""} uploaded!`)
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<ProductInput>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: Number(product.price),
          discountPrice: product.discountPrice ? Number(product.discountPrice) : undefined,
          stock: product.stock,
          sku: product.sku,
          status: product.status,
          featured: product.featured,
          categoryId: product.categoryId,
          sizes: product.sizes.map((s) => s.size),
          colors: product.colors.map((c) => ({ color: c.color, hex: c.hex || undefined })),
          images: product.images.map((i) => i.imageUrl),
        }
      : {
          status: "ACTIVE",
          featured: false,
          sizes: [],
          colors: [],
          images: [],
        },
  })

  const watchedName = watch("name")
  const watchedSizes = watch("sizes") || []
  const watchedColors = watch("colors") || []

  const onSubmit = async (data: ProductInput) => {
    if (images.length === 0) { toast.error("Please upload at least one image"); return }
    setLoading(true)
    try {
      const payload = { ...data, images }
      if (product) {
        await axios.put(`/api/products/${product.id}`, payload)
        toast.success("Product updated!")
      } else {
        await axios.post("/api/products", payload)
        toast.success("Product created!")
      }
      router.push("/admin/products")
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to save product")
    } finally {
      setLoading(false)
    }
  }

  const toggleSize = (size: string) => {
    const current = watchedSizes
    setValue("sizes", current.includes(size) ? current.filter((s) => s !== size) : [...current, size])
  }

  const addColor = () => {
    setValue("colors", [...watchedColors, { color: "", hex: "" }])
  }

  const removeColor = (i: number) => {
    setValue("colors", watchedColors.filter((_, idx) => idx !== i))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input {...register("name")} placeholder="Product name" className="mt-1"
                onChange={(e) => {
                  register("name").onChange(e)
                  if (!product) {
                    setValue("slug", slugify(e.target.value))
                    setValue("sku", generateSKU(e.target.value))
                  }
                }}
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Slug</Label>
              <Input {...register("slug")} placeholder="product-slug" className="mt-1" />
              {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>}
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <textarea
              {...register("description")}
              rows={4}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              placeholder="Product description..."
            />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Price ($)</Label>
              <Input type="number" step="0.01" {...register("price")} className="mt-1" />
              {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <Label>Discount Price ($)</Label>
              <Input type="number" step="0.01" {...register("discountPrice")} className="mt-1" />
            </div>
            <div>
              <Label>Stock</Label>
              <Input type="number" {...register("stock")} className="mt-1" />
              {errors.stock && <p className="text-xs text-destructive mt-1">{errors.stock.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>SKU</Label>
              <Input {...register("sku")} className="mt-1" />
            </div>
            <div>
              <Label>Category</Label>
              <Select onValueChange={(v) => v && setValue("categoryId", v)} defaultValue={product?.categoryId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-destructive mt-1">{errors.categoryId.message}</p>}
            </div>
            <div>
              <Label>Status</Label>
              <Select onValueChange={(v) => setValue("status", v as "ACTIVE" | "INACTIVE")} defaultValue={product?.status || "ACTIVE"}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="featured"
              defaultChecked={product?.featured}
              onCheckedChange={(checked) => setValue("featured", !!checked)}
            />
            <Label htmlFor="featured" className="cursor-pointer">Featured product</Label>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader><CardTitle>Images</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div key={i} className="relative h-24 w-20 rounded-md overflow-hidden bg-muted">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => {
                  const next = images.filter((_, idx) => idx !== i)
                  setImages(next)
                  setValue("images", next)
                }}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Images"}
          </Button>
          <p className="text-xs text-muted-foreground">Select one or more images from your computer. Max 10MB per file.</p>
          {errors.images && <p className="text-xs text-destructive">{errors.images.message as string}</p>}
        </CardContent>
      </Card>

      {/* Sizes */}
      <Card>
        <CardHeader><CardTitle>Sizes</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {COMMON_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`h-9 px-3 rounded-md border text-sm font-medium transition-colors ${
                  watchedSizes.includes(size) ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          {errors.sizes && <p className="text-xs text-destructive mt-2">{errors.sizes.message as string}</p>}
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Colors</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addColor}><Plus className="h-4 w-4 mr-1" /> Add Color</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {watchedColors.map((color, i) => (
            <div key={i} className="flex gap-3 items-center">
              <Input
                placeholder="Color name (e.g. Red)"
                value={color.color}
                onChange={(e) => {
                  const updated = [...watchedColors]
                  updated[i] = { ...updated[i], color: e.target.value }
                  setValue("colors", updated)
                }}
              />
              <Input
                type="color"
                value={color.hex || "#000000"}
                onChange={(e) => {
                  const updated = [...watchedColors]
                  updated[i] = { ...updated[i], hex: e.target.value }
                  setValue("colors", updated)
                }}
                className="w-16 p-1 h-9"
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeColor(i)}>
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {errors.colors && <p className="text-xs text-destructive mt-1">{errors.colors.message as string}</p>}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} size="lg">
          {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
