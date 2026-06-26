import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Heart, User } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "My Profile" }

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: { select: { orders: true, wishlistItems: true } },
    },
  })

  if (!user) redirect("/auth/login")

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
              <AvatarFallback className="text-2xl">{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="mt-2">
                {user.role}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{user._count.orders}</p>
              <p className="text-sm text-muted-foreground">Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{user._count.wishlistItems}</p>
              <p className="text-sm text-muted-foreground">Wishlist Items</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Member since</span>
            <span>{user.createdAt.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Login method</span>
            <span>{user.password ? "Email/Password" : "Google"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
