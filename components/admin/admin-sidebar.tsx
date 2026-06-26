"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"
import { useCart } from "@/hooks/use-cart"
import {
  LayoutDashboard, Package, Tag, ShoppingCart, Users, BarChart2, LogOut, Home,
} from "lucide-react"

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { clearCart } = useCart()

  return (
    <aside className="w-60 bg-card border-r flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/" className="text-xl font-bold tracking-tighter">StyleHub</Link>
        <span className="ml-2 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Admin</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === href || (href !== "/admin" && pathname.startsWith(href))
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted">
          <Home className="h-4 w-4" /> Back to Store
        </Link>
        <button
          onClick={() => { clearCart(); signOut({ callbackUrl: "/" }) }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </aside>
  )
}
