import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingBag, Package, Users } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Admin Dashboard" }

export default async function AdminDashboard() {
  const [revenue, totalOrders, totalProducts, totalUsers, recentOrders] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ])

  const stats = [
    { title: "Total Revenue", value: formatPrice(Number(revenue._sum.totalAmount || 0)), icon: DollarSign, color: "text-green-600" },
    { title: "Total Orders", value: totalOrders.toString(), icon: ShoppingBag, color: "text-blue-600" },
    { title: "Total Products", value: totalProducts.toString(), icon: Package, color: "text-purple-600" },
    { title: "Total Users", value: totalUsers.toString(), icon: Users, color: "text-orange-600" },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ title, value, icon: Icon, color }) => (
          <Card key={title}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-full bg-muted flex items-center justify-center ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-3 text-left font-medium">Order ID</th>
                <th className="pb-3 text-left font-medium">Customer</th>
                <th className="pb-3 text-left font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="py-3 font-mono text-xs">#{order.id.slice(-8).toUpperCase()}</td>
                  <td className="py-3">{order.user.name}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      order.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                      order.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-right font-semibold">{formatPrice(Number(order.totalAmount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
