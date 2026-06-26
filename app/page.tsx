export const dynamic = "force-dynamic"

import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import HeroSection from "@/components/home/hero-section"
import FeaturedProducts from "@/components/home/featured-products"
import CategoriesSection from "@/components/home/categories-section"
import PromoSection from "@/components/home/promo-section"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <FeaturedProducts />
        <PromoSection />
      </main>
      <Footer />
    </div>
  )
}
