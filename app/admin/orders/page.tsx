import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import AdminOrderActions from "@/components/admin/admin-order-actions"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Admin — Orders" }

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Orders</h1>
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-4 text-left font-medium">Order</th>
              <th className="p-4 text-left font-medium">Customer</th>
              <th className="p-4 text-left font-medium">Items</th>
              <th className="p-4 text-left font-medium">Total</th>
              <th className="p-4 text-left font-medium">Date</th>
              <th className="p-4 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/30">
                <td className="p-4 font-mono text-xs">#{order.id.slice(-8).toUpperCase()}</td>
                <td className="p-4">
                  <p className="font-medium">{order.user.name}</p>
                  <p className="text-xs text-muted-foreground">{order.user.email}</p>
                </td>
                <td className="p-4 text-muted-foreground">{order.items.length} item(s)</td>
                <td className="p-4 font-semibold">{formatPrice(Number(order.totalAmount))}</td>
                <td className="p-4 text-muted-foreground">{order.createdAt.toLocaleDateString()}</td>
                <td className="p-4">
                  <AdminOrderActions orderId={order.id} currentStatus={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
