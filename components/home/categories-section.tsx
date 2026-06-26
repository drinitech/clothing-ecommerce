import Link from "next/link"

const categories = [
  { name: "Men", slug: "men", image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=80", color: "from-zinc-800" },
  { name: "Women", slug: "women", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80", color: "from-rose-900" },
  { name: "Kids", slug: "kids", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80", color: "from-blue-900" },
  { name: "Shoes", slug: "shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", color: "from-amber-900" },
  { name: "Accessories", slug: "accessories", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", color: "from-emerald-900" },
]

export default function CategoriesSection() {
  return (
    <section className="py-16 container mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold">Shop by Category</h2>
        <p className="text-muted-foreground mt-2">Find exactly what you're looking for</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <Link key={cat.name} href={`/products?category=${cat.slug}`} className="group relative aspect-[3/4] overflow-hidden rounded-xl">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url(${cat.image})` }}
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent opacity-60`} />
            <div className="absolute inset-0 flex items-end p-4">
              <span className="text-white font-bold text-lg">{cat.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
