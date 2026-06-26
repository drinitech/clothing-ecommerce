import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden bg-zinc-900">
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-10" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80')] bg-cover bg-center" />

      <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-xl text-white space-y-6">
          <p className="text-sm font-medium tracking-widest uppercase text-zinc-300">New Collection 2025</p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Dress Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
              Best Self
            </span>
          </h1>
          <p className="text-lg text-zinc-300 max-w-md">
            Discover premium clothing crafted for style, comfort, and confidence. Shop the latest trends.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/products" className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-white text-black hover:bg-zinc-100 font-semibold text-sm transition-colors">
              Shop Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/products?featured=true" className="inline-flex items-center justify-center h-9 px-4 rounded-lg border border-white text-white hover:bg-white/10 font-medium text-sm transition-colors">
              Featured
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/60 text-xs">
        <span>Scroll</span>
        <div className="w-px h-8 bg-white/30 animate-pulse" />
      </div>
    </section>
  )
}
