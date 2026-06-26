import { auth } from "@/auth"
import { NextResponse } from "next/server"

const protectedRoutes = ["/profile", "/orders", "/checkout"]
const adminRoutes = ["/admin"]
const authRoutes = ["/auth/login", "/auth/register"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const isAdmin = req.auth?.user?.role === "ADMIN"

  if (adminRoutes.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login?callbackUrl=" + pathname, req.url))
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  if (protectedRoutes.some((r) => pathname.startsWith(r)) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login?callbackUrl=" + pathname, req.url))
  }

  if (authRoutes.includes(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
