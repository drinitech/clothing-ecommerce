import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Decimal } from "@prisma/client/runtime/library"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(price))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function generateSKU(name: string): string {
  const prefix = name.substring(0, 3).toUpperCase()
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `${prefix}-${random}`
}

export function calculateDiscount(price: number, discountPrice: number): number {
  return Math.round(((price - discountPrice) / price) * 100)
}

type WithDecimalPrices<T> = Omit<T, "price" | "discountPrice"> & {
  price: Decimal
  discountPrice: Decimal | null
}

export function serializeProduct<T extends WithDecimalPrices<T>>(
  product: T
): Omit<T, "price" | "discountPrice"> & { price: number; discountPrice: number | null } {
  return {
    ...product,
    price: product.price.toNumber(),
    discountPrice: product.discountPrice?.toNumber() ?? null,
  }
}
