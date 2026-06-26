"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Category } from "@prisma/client"
import { useState } from "react"

interface ProductFiltersProps {
  categories: Category[]
  currentParams: Record<string, string>
}

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
]

export default function ProductFilters({ categories, currentParams }: ProductFiltersProps) {
  const router = useRouter()
  const [minPrice, setMinPrice] = useState(currentParams.minPrice || "")
  const [maxPrice, setMaxPrice] = useState(currentParams.maxPrice || "")

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(currentParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    router.push(`/products?${params.toString()}`)
  }

  const clearAll = () => router.push("/products")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearAll}>Clear all</Button>
      </div>

      <div>
        <p className="text-sm font-medium mb-3">Sort By</p>
        <div className="space-y-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParam("sortBy", opt.value)}
              className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                (currentParams.sortBy || "newest") === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-sm font-medium mb-3">Category</p>
        <div className="space-y-1">
          <button
            onClick={() => updateParam("category", "")}
            className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
              !currentParams.category ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam("category", cat.slug)}
              className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                currentParams.category === cat.slug ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-sm font-medium mb-3">Price Range</p>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={() => updateParam("minPrice", minPrice)}
            className="w-full border rounded-md px-2 py-1.5 text-sm bg-background"
          />
          <span className="text-muted-foreground">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={() => updateParam("maxPrice", maxPrice)}
            className="w-full border rounded-md px-2 py-1.5 text-sm bg-background"
          />
        </div>
      </div>
    </div>
  )
}
