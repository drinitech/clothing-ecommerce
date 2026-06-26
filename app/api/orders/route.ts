import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { shippingAddressSchema } from "@/lib/validations"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: { include: { images: { take: 1 }, category: true, sizes: true, colors: true, reviews: { select: { rating: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const addressParsed = shippingAddressSchema.safeParse(body.shippingAddress)
    if (!addressParsed.success) {
      return NextResponse.json({ error: "Invalid shipping address" }, { status: 400 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    const totalAmount = cartItems.reduce((acc, item) => {
      const price = Number(item.product.discountPrice ?? item.product.price)
      return acc + price * item.quantity
    }, 0)

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: session.user!.id!,
          totalAmount,
          shippingAddress: addressParsed.data,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: Number(item.product.discountPrice ?? item.product.price),
              size: item.size,
              color: item.color,
            })),
          },
        },
        include: { items: { include: { product: { include: { images: { take: 1 }, category: true, sizes: true, colors: true, reviews: { select: { rating: true } } } } } } },
      })

      await tx.cartItem.deleteMany({ where: { userId: session.user!.id! } })

      return newOrder
    })

    return NextResponse.json(order, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
