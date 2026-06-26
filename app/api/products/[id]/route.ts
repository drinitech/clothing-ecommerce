import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { productSchema } from "@/lib/validations"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }], status: "ACTIVE" },
      include: {
        category: true,
        images: { orderBy: { order: "asc" } },
        sizes: true,
        colors: true,
        reviews: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { sizes, colors, images, ...data } = parsed.data

    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.productSize.deleteMany({ where: { productId: id } }),
      prisma.productColor.deleteMany({ where: { productId: id } }),
    ])

    const product = await prisma.product.update({
      where: { id },
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

    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
