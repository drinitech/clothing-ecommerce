import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().min(10, "Description is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  discountPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().min(2, "SKU is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  featured: z.boolean().default(false),
  categoryId: z.string().min(1, "Category is required"),
  sizes: z.array(z.string()).min(1, "At least one size is required"),
  colors: z.array(z.object({ color: z.string(), hex: z.string().optional() })).min(1, "At least one color is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
})

export const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
  image: z.string().optional(),
})

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional(),
})

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(4, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
  phone: z.string().min(7, "Phone number is required"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProductInput = z.infer<typeof productSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>
