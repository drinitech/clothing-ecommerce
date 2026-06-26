import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env") })

import { PrismaClient } from "@prisma/client"
import { Pool, neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import ws from "ws"
import bcrypt from "bcryptjs"

neonConfig.webSocketConstructor = ws

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set in .env")

const pool = new Pool({ connectionString: DATABASE_URL })
const adapter = new PrismaNeon(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@stylehub.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@stylehub.com",
      password: adminPassword,
      role: "ADMIN",
    },
  })

  // Customer user
  const customerPassword = await bcrypt.hash("customer123", 12)
  await prisma.user.upsert({
    where: { email: "customer@stylehub.com" },
    update: {},
    create: {
      name: "Jane Doe",
      email: "customer@stylehub.com",
      password: customerPassword,
      role: "CUSTOMER",
    },
  })

  // Categories
  const categoryData = [
    { name: "Men", slug: "men" },
    { name: "Women", slug: "women" },
    { name: "Kids", slug: "kids" },
    { name: "Shoes", slug: "shoes" },
    { name: "Accessories", slug: "accessories" },
  ]

  const categories: Record<string, string> = {}
  for (const cat of categoryData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    categories[cat.slug] = created.id
  }

  // Products
  const products = [
    {
      name: "Classic White Tee",
      slug: "classic-white-tee",
      description: "A timeless white t-shirt crafted from 100% premium cotton. Perfect for any casual occasion.",
      price: 29.99,
      discountPrice: 24.99,
      stock: 150,
      sku: "CWT-001",
      categoryId: categories["men"],
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80",
      ],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [{ color: "White", hex: "#FFFFFF" }, { color: "Black", hex: "#000000" }],
    },
    {
      name: "Slim Fit Chinos",
      slug: "slim-fit-chinos",
      description: "Versatile slim-fit chinos that transition seamlessly from office to weekend wear.",
      price: 79.99,
      stock: 80,
      sku: "SFC-002",
      categoryId: categories["men"],
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=80",
      ],
      sizes: ["30", "32", "34", "36", "38"],
      colors: [{ color: "Khaki", hex: "#C3B091" }, { color: "Navy", hex: "#1B2A4A" }],
    },
    {
      name: "Floral Summer Dress",
      slug: "floral-summer-dress",
      description: "A beautiful floral-print dress perfect for warm summer days. Light and breathable fabric.",
      price: 89.99,
      discountPrice: 69.99,
      stock: 60,
      sku: "FSD-003",
      categoryId: categories["women"],
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
      ],
      sizes: ["XS", "S", "M", "L"],
      colors: [{ color: "Floral Pink", hex: "#FFB6C1" }, { color: "Floral Blue", hex: "#87CEEB" }],
    },
    {
      name: "High-Waist Yoga Pants",
      slug: "high-waist-yoga-pants",
      description: "Performance yoga pants with high waist support. Moisture-wicking and four-way stretch.",
      price: 65.00,
      stock: 100,
      sku: "HWY-004",
      categoryId: categories["women"],
      featured: false,
      images: [
        "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80",
      ],
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Charcoal", hex: "#36454F" }],
    },
    {
      name: "Kids Colorful Hoodie",
      slug: "kids-colorful-hoodie",
      description: "Warm and cozy hoodie for kids with fun colorful patterns. Machine washable.",
      price: 45.00,
      stock: 75,
      sku: "KCH-005",
      categoryId: categories["kids"],
      featured: false,
      images: [
        "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80",
      ],
      sizes: ["XS", "S", "M", "L"],
      colors: [{ color: "Red", hex: "#FF0000" }, { color: "Blue", hex: "#0000FF" }],
    },
    {
      name: "Running Sneakers Pro",
      slug: "running-sneakers-pro",
      description: "Professional running shoes with superior cushioning and breathable mesh upper.",
      price: 129.99,
      discountPrice: 99.99,
      stock: 45,
      sku: "RSP-006",
      categoryId: categories["shoes"],
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
      ],
      sizes: ["40", "41", "42", "43", "44", "45"],
      colors: [{ color: "White/Blue", hex: "#4169E1" }, { color: "Black/Red", hex: "#DC143C" }],
    },
    {
      name: "Leather Belt Classic",
      slug: "leather-belt-classic",
      description: "Genuine leather belt with polished buckle. A wardrobe essential.",
      price: 39.99,
      stock: 200,
      sku: "LBC-007",
      categoryId: categories["accessories"],
      featured: false,
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
      ],
      sizes: ["S", "M", "L", "XL"],
      colors: [{ color: "Brown", hex: "#8B4513" }, { color: "Black", hex: "#000000" }],
    },
    {
      name: "Wool Blend Overcoat",
      slug: "wool-blend-overcoat",
      description: "Premium wool blend overcoat for the colder months. Tailored fit with two-button closure.",
      price: 249.99,
      stock: 30,
      sku: "WBO-008",
      categoryId: categories["men"],
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1548864734-3b8c42c71db6?w=600&q=80",
      ],
      sizes: ["S", "M", "L", "XL"],
      colors: [{ color: "Camel", hex: "#C19A6B" }, { color: "Grey", hex: "#808080" }],
    },
  ]

  for (const p of products) {
    const { images, sizes, colors, ...data } = p
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...data,
        status: "ACTIVE",
        images: { create: images.map((url, i) => ({ imageUrl: url, order: i })) },
        sizes: { create: sizes.map((size) => ({ size })) },
        colors: { create: colors.map(({ color, hex }) => ({ color, hex })) },
      },
    })
  }

  console.log("Seed complete!")
  console.log("Admin login: admin@stylehub.com / admin123")
  console.log("Customer login: customer@stylehub.com / customer123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
