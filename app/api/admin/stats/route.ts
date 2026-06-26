import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [totalRevenue, totalOrders, totalProducts, totalUsers, recentOrders] = await Promise.all([
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { include: { images: { take: 1 }, category: true, sizes: true, colors: true, reviews: { select: { rating: true } } } } } },
        },
      }),
    ])

    return NextResponse.json({
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders,
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
