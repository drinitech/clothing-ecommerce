import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const items = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            images: { orderBy: { order: "asc" }, take: 1 },
            category: true,
            sizes: true,
            colors: true,
            reviews: { select: { rating: true } },
          },
        },
      },
    })

    return NextResponse.json(items)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { productId, quantity = 1, size, color } = await req.json()

    const existing = await prisma.cartItem.findFirst({
      where: { userId: session.user.id, productId, size: size ?? null, color: color ?? null },
    })

    const safeSize = size ?? null
    const safeColor = color ?? null

    let itemId: string
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      })
      itemId = existing.id
    } else {
      const created = await prisma.cartItem.create({
        data: { userId: session.user.id, productId, quantity, size: safeSize, color: safeColor },
      })
      itemId = created.id
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: { include: { images: { take: 1 }, category: true, sizes: true, colors: true, reviews: { select: { rating: true } } } } },
    })

    return NextResponse.json(item, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { itemId } = await req.json()
    await prisma.cartItem.deleteMany({ where: { id: itemId, userId: session.user.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { itemId, quantity } = await req.json()

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({ where: { id: itemId, userId: session.user.id } })
      return NextResponse.json({ success: true })
    }

    const item = await prisma.cartItem.updateMany({
      where: { id: itemId, userId: session.user.id },
      data: { quantity },
    })

    return NextResponse.json(item)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
