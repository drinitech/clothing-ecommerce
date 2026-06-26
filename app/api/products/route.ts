import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { productSchema } from "@/lib/validations"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const sortBy = searchParams.get("sortBy") || "newest"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")

    const where = {
      status: "ACTIVE" as const,
      ...(category && { category: { slug: category } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(featured === "true" && { featured: true }),
      ...(minPrice || maxPrice
        ? {
            price: {
              ...(minPrice && { gte: parseFloat(minPrice) }),
              ...(maxPrice && { lte: parseFloat(maxPrice) }),
            },
          }
        : {}),
    }

    const orderBy =
      sortBy === "price_asc"
        ? { price: "asc" as const }
        : sortBy === "price_desc"
        ? { price: "desc" as const }
        : { createdAt: "desc" as const }

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

    return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { sizes, colors, images, ...data } = parsed.data

    const product = await prisma.product.create({
      data: {
        ...data,
        price: data.price,
        discountPrice: data.discountPrice ?? null,
        images: { create: images.map((url, i) => ({ imageUrl: url, order: i })) },
        sizes: { create: sizes.map((size) => ({ size })) },
        colors: { create: colors.map(({ color, hex }) => ({ color, hex })) },
      },
      include: { category: true, images: true, sizes: true, colors: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
