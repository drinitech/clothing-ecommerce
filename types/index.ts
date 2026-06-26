import { Product, Category, User, Order, OrderItem, Review, CartItem, WishlistItem, ProductImage, ProductSize, ProductColor } from "@prisma/client"

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "name" | "image">
}

export type ProductWithRelations = Product & {
  category: Category
  images: ProductImage[]
  sizes: ProductSize[]
  colors: ProductColor[]
  reviews: ReviewWithUser[]
}

export type CartItemWithProduct = CartItem & {
  product: ProductWithRelations
}

export type WishlistItemWithProduct = WishlistItem & {
  product: ProductWithRelations
}

export type OrderWithItems = Order & {
  items: (OrderItem & { product: ProductWithRelations })[]
  user: User
}

export type ProductFilters = {
  category?: string
  minPrice?: number
  maxPrice?: number
  sizes?: string[]
  colors?: string[]
  search?: string
  featured?: boolean
  sortBy?: "price_asc" | "price_desc" | "newest" | "popular"
  page?: number
  limit?: number
}

export type PaginatedProducts = {
  products: ProductWithRelations[]
  total: number
  page: number
  totalPages: number
}

export type ShippingAddress = {
  fullName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

export type DashboardStats = {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalUsers: number
  recentOrders: OrderWithItems[]
  salesData: { date: string; sales: number }[]
}
