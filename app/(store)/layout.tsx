import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"

export const dynamic = "force-dynamic"

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
