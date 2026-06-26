import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const items = await prisma.wishlistItem.findMany({
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

    const { productId } = await req.json()

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: session.user.id, productId } },
    })

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } })
      return NextResponse.json({ added: false })
    }

    await prisma.wishlistItem.create({ data: { userId: session.user.id, productId } })
    return NextResponse.json({ added: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
