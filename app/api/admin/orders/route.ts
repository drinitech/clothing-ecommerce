import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { include: { images: { take: 1 }, category: true, sizes: true, colors: true, reviews: { select: { rating: true } } } } } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, status } = await req.json()
    const order = await prisma.order.update({ where: { id: orderId }, data: { status } })
    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
