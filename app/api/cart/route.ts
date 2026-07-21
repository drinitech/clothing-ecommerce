import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getToken } from "next-auth/jwt"

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: req.nextUrl.protocol === "https:",
  })
  return (token?.id as string) ?? null
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const items = await prisma.cartItem.findMany({
      where: { userId },
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
  } catch (error) {
    console.error("[GET /api/cart]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { productId, quantity = 1, size, color } = await req.json()

    const safeSize = size ?? null
    const safeColor = color ?? null

    const existing = await prisma.cartItem.findFirst({
      where: { userId, productId, size: safeSize, color: safeColor },
    })

    let itemId: string
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      })
      itemId = existing.id
    } else {
      const created = await prisma.cartItem.create({
        data: { userId, productId, quantity, size: safeSize, color: safeColor },
      })
      itemId = created.id
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
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

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("[POST /api/cart]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId(req)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { itemId } = await req.json()
    await prisma.cartItem.deleteMany({ where: { id: itemId, userId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE /api/cart]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserId(req)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { itemId, quantity } = await req.json()

    if (!itemId) return NextResponse.json({ error: "Missing itemId" }, { status: 400 })

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({ where: { id: itemId, userId } })
      return NextResponse.json({ success: true })
    }

    // updateMany uses transactions (unsupported in Neon HTTP mode) — use findFirst + update instead
    const item = await prisma.cartItem.findFirst({ where: { id: itemId, userId } })
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 })

    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PATCH /api/cart]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
