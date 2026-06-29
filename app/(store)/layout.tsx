import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
    </div>
  )
}
