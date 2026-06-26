import Link from "next/link"
import { Truck, RotateCcw, Shield, Headphones } from "lucide-react"

const perks = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $75" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
  { icon: Headphones, title: "24/7 Support", desc: "We're always here" },
]

export default function PromoSection() {
  return (
    <>
      {/* Promo banner */}
      <section className="bg-zinc-900 text-white py-20">
        <div className="container mx-auto px-4 text-center space-y-6">
          <p className="text-sm tracking-widest uppercase text-zinc-400">Limited Time Offer</p>
          <h2 className="text-4xl md:text-5xl font-bold">Up to 50% Off Sale</h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            Don't miss our biggest sale of the year. Shop hundreds of styles at incredible prices.
          </p>
          <Link href="/products" className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-white text-black hover:bg-zinc-100 font-semibold text-sm transition-colors">Shop the Sale</Link>
        </div>
      </section>

      {/* Perks */}
      <section className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center gap-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
