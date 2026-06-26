import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Image from "next/image"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "My Orders" }

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: { include: { images: { orderBy: { order: "asc" }, take: 1 } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No orders yet</p>
          <p className="text-sm mt-1">Start shopping to see your orders here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm font-medium">{order.createdAt.toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="font-semibold">{formatPrice(Number(order.totalAmount))}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="relative h-14 w-12 rounded-md overflow-hidden bg-muted shrink-0">
                      {item.product.images[0] && (
                        <Image src={item.product.images[0].imageUrl} alt={item.product.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} · {formatPrice(Number(item.price))} each
                        {item.size && ` · Size: ${item.size}`}
                        {item.color && ` · ${item.color}`}
                      </p>
                    </div>
                    <p className="text-sm font-medium shrink-0">{formatPrice(Number(item.price) * item.quantity)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
