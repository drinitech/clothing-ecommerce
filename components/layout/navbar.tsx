"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { ShoppingBag, Heart, Search, Menu, Sun, Moon, User, ChevronDown, X, Tag, Sparkles } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"
import { useCart, useCartCount } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import CartDrawer from "@/components/cart/cart-drawer"

type Category = { id: string; name: string; slug: string }

export default function Navbar({ categories }: { categories: Category[] }) {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const cartCount = useCartCount()
  const { clearCart } = useCart()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery("")
    }
  }

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-primary text-primary-foreground text-center text-xs py-2 px-4 tracking-wide font-medium">
        Free shipping on orders over $50 &nbsp;·&nbsp; New arrivals every week
      </div>

      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-4">

            {/* Mobile menu trigger */}
            <Sheet>
              <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-lg size-9 hover:bg-muted transition-colors shrink-0">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="px-5 py-5 border-b">
                    <Link href="/" className="text-2xl font-bold tracking-tighter">StyleHub</Link>
                  </div>
                  <nav className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Shop by Category</p>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.slug}`}
                        className="flex items-center gap-2 text-sm font-medium py-2 px-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <div className="pt-3 mt-3 border-t space-y-1">
                      <Link href="/products?sort=newest" className="flex items-center gap-2 text-sm font-medium py-2 px-3 rounded-lg hover:bg-muted transition-colors text-primary">
                        <Sparkles className="h-4 w-4" /> New Arrivals
                      </Link>
                      <Link href="/products?discount=true" className="flex items-center gap-2 text-sm font-medium py-2 px-3 rounded-lg hover:bg-muted transition-colors text-destructive">
                        <Tag className="h-4 w-4" /> Sale
                      </Link>
                    </div>
                  </nav>
                  {session && (
                    <div className="px-5 py-4 border-t space-y-1">
                      <Link href="/profile" className="flex items-center gap-2 text-sm py-2 px-3 rounded-lg hover:bg-muted transition-colors">Profile</Link>
                      <Link href="/orders" className="flex items-center gap-2 text-sm py-2 px-3 rounded-lg hover:bg-muted transition-colors">My Orders</Link>
                      <button
                        onClick={() => { clearCart(); signOut({ callbackUrl: "/" }) }}
                        className="w-full text-left flex items-center gap-2 text-sm py-2 px-3 rounded-lg hover:bg-muted transition-colors text-destructive"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="text-xl font-bold tracking-tighter shrink-0 mr-2">
              StyleHub
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {/* Shop dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" className="gap-1.5 font-medium" />}>
                  Shop <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="!w-auto min-w-[480px] p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Browse Categories</p>
                  <div className="grid grid-cols-3 gap-1">
                    {categories.map((cat) => (
                      <DropdownMenuItem key={cat.id} render={<Link href={`/products?category=${cat.slug}`} />} className="rounded-lg px-3 py-2.5 font-medium text-sm hover:bg-muted cursor-pointer">
                        {cat.name}
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <DropdownMenuSeparator className="my-3" />
                  <div className="flex gap-2">
                    <DropdownMenuItem render={<Link href="/products?sort=newest" />} className="flex-1 rounded-lg px-3 py-2 text-sm font-medium text-primary justify-center">
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" /> New Arrivals
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/products?discount=true" />} className="flex-1 rounded-lg px-3 py-2 text-sm font-medium text-destructive justify-center">
                      <Tag className="h-3.5 w-3.5 mr-1.5" /> Sale
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Quick access links for most visited */}
              {categories.slice(0, 4).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Search */}
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <Input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="h-8 w-40 md:w-56"
                  />
                  <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => setSearchOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
                  <Search className="h-5 w-5" />
                </Button>
              )}

              {/* Theme toggle */}
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              {/* Wishlist */}
              <Link href="/wishlist" className="inline-flex items-center justify-center rounded-lg size-9 hover:bg-muted transition-colors text-foreground">
                <Heart className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <CartDrawer>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Button>
              </CartDrawer>

              {/* User */}
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full" />}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image ?? ""} alt={session.user?.name ?? ""} />
                      <AvatarFallback className="text-xs font-semibold">{session.user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-2 py-2">
                      <p className="text-sm font-semibold">{session.user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/profile" />}>Profile</DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/orders" />}>My Orders</DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/wishlist" />}>Wishlist</DropdownMenuItem>
                    {session.user?.role === "ADMIN" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem render={<Link href="/admin" />}>Admin Dashboard</DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { clearCart(); signOut({ callbackUrl: "/" }) }} variant="destructive">
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth/login" className="inline-flex items-center justify-center rounded-lg size-9 hover:bg-muted transition-colors text-foreground">
                  <User className="h-5 w-5" />
                </Link>
              )}
            </div>

          </div>
        </div>
      </header>
    </>
  )
}
