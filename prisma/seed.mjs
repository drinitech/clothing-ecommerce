/**
 * Seed script using @neondatabase/serverless HTTP connection.
 * Run with: node prisma/seed.mjs
 */
import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { createHash, randomBytes } from "crypto";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");

const sql = neon(DATABASE_URL);

function cuid() {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(8).toString("hex");
  return `c${timestamp}${random}`;
}

async function main() {
  console.log("🌱 Seeding NeonDB database...\n");

  // --- Users ---
  const adminPassword = await bcrypt.hash("admin123", 12);
  const customerPassword = await bcrypt.hash("customer123", 12);
  const adminId = cuid();
  const customerId = cuid();
  const now = new Date().toISOString();

  await sql.query(`
    INSERT INTO "User" ("id","name","email","password","role","createdAt","updatedAt")
    VALUES ($1,'Admin User','admin@stylehub.com',$2,'ADMIN',$3,$3)
    ON CONFLICT ("email") DO NOTHING
  `, [adminId, adminPassword, now]);

  await sql.query(`
    INSERT INTO "User" ("id","name","email","password","role","createdAt","updatedAt")
    VALUES ($1,'Jane Doe','customer@stylehub.com',$2,'CUSTOMER',$3,$3)
    ON CONFLICT ("email") DO NOTHING
  `, [customerId, customerPassword, now]);

  console.log("✅ Users created");

  // --- Categories ---
  const catData = [
    { name: "Men", slug: "men" },
    { name: "Women", slug: "women" },
    { name: "Kids", slug: "kids" },
    { name: "Shoes", slug: "shoes" },
    { name: "Accessories", slug: "accessories" },
  ];

  const categoryIds = {};
  for (const cat of catData) {
    const id = cuid();
    await sql.query(`
      INSERT INTO "Category" ("id","name","slug","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$4)
      ON CONFLICT ("slug") DO NOTHING
    `, [id, cat.name, cat.slug, now]);

    // Get the actual id (might already exist)
    const [row] = await sql.query(`SELECT "id" FROM "Category" WHERE "slug" = $1`, [cat.slug]);
    categoryIds[cat.slug] = row.id;
  }

  console.log("✅ Categories created:", Object.keys(categoryIds).join(", "));

  // --- Products ---
  const products = [
    {
      name: "Classic White Tee",
      slug: "classic-white-tee",
      description: "A timeless white t-shirt crafted from 100% premium cotton. Perfect for any casual occasion.",
      price: 29.99, discountPrice: 24.99, stock: 150, sku: "CWT-001",
      category: "men", featured: true,
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80",
      ],
      sizes: ["S","M","L","XL","XXL"],
      colors: [{ color: "White", hex: "#FFFFFF" }, { color: "Black", hex: "#000000" }],
    },
    {
      name: "Slim Fit Chinos",
      slug: "slim-fit-chinos",
      description: "Versatile slim-fit chinos that transition seamlessly from office to weekend wear.",
      price: 79.99, stock: 80, sku: "SFC-002",
      category: "men", featured: true,
      images: ["https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&q=80"],
      sizes: ["30","32","34","36","38"],
      colors: [{ color: "Khaki", hex: "#C3B091" }, { color: "Navy", hex: "#1B2A4A" }],
    },
    {
      name: "Floral Summer Dress",
      slug: "floral-summer-dress",
      description: "A beautiful floral-print dress perfect for warm summer days. Light and breathable fabric.",
      price: 89.99, discountPrice: 69.99, stock: 60, sku: "FSD-003",
      category: "women", featured: true,
      images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80"],
      sizes: ["XS","S","M","L"],
      colors: [{ color: "Floral Pink", hex: "#FFB6C1" }, { color: "Floral Blue", hex: "#87CEEB" }],
    },
    {
      name: "High-Waist Yoga Pants",
      slug: "high-waist-yoga-pants",
      description: "Performance yoga pants with high waist support. Moisture-wicking and four-way stretch.",
      price: 65.00, stock: 100, sku: "HWY-004",
      category: "women", featured: false,
      images: ["https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80"],
      sizes: ["XS","S","M","L","XL"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Charcoal", hex: "#36454F" }],
    },
    {
      name: "Kids Colorful Hoodie",
      slug: "kids-colorful-hoodie",
      description: "Warm and cozy hoodie for kids with fun colorful patterns. Machine washable.",
      price: 45.00, stock: 75, sku: "KCH-005",
      category: "kids", featured: false,
      images: ["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80"],
      sizes: ["XS","S","M","L"],
      colors: [{ color: "Red", hex: "#FF0000" }, { color: "Blue", hex: "#0000FF" }],
    },
    {
      name: "Running Sneakers Pro",
      slug: "running-sneakers-pro",
      description: "Professional running shoes with superior cushioning and breathable mesh upper.",
      price: 129.99, discountPrice: 99.99, stock: 45, sku: "RSP-006",
      category: "shoes", featured: true,
      images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"],
      sizes: ["40","41","42","43","44","45"],
      colors: [{ color: "White/Blue", hex: "#4169E1" }, { color: "Black/Red", hex: "#DC143C" }],
    },
    {
      name: "Leather Belt Classic",
      slug: "leather-belt-classic",
      description: "Genuine leather belt with polished buckle. A wardrobe essential.",
      price: 39.99, stock: 200, sku: "LBC-007",
      category: "accessories", featured: false,
      images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"],
      sizes: ["S","M","L","XL"],
      colors: [{ color: "Brown", hex: "#8B4513" }, { color: "Black", hex: "#000000" }],
    },
    {
      name: "Wool Blend Overcoat",
      slug: "wool-blend-overcoat",
      description: "Premium wool blend overcoat for the colder months. Tailored fit with two-button closure.",
      price: 249.99, stock: 30, sku: "WBO-008",
      category: "men", featured: true,
      images: ["https://images.unsplash.com/photo-1548864734-3b8c42c71db6?w=600&q=80"],
      sizes: ["S","M","L","XL"],
      colors: [{ color: "Camel", hex: "#C19A6B" }, { color: "Grey", hex: "#808080" }],
    },
  ];

  for (const p of products) {
    const productId = cuid();
    const catId = categoryIds[p.category];

    await sql.query(`
      INSERT INTO "Product" ("id","name","slug","description","price","discountPrice","stock","sku","status","featured","categoryId","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'ACTIVE',$9,$10,$11,$11)
      ON CONFLICT ("slug") DO NOTHING
    `, [productId, p.name, p.slug, p.description, p.price, p.discountPrice ?? null,
        p.stock, p.sku, p.featured, catId, now]);

    // Get actual product id
    const [row] = await sql.query(`SELECT "id" FROM "Product" WHERE "slug" = $1`, [p.slug]);
    const pid = row.id;

    for (let i = 0; i < p.images.length; i++) {
      await sql.query(`
        INSERT INTO "ProductImage" ("id","productId","imageUrl","order")
        VALUES ($1,$2,$3,$4)
        ON CONFLICT DO NOTHING
      `, [cuid(), pid, p.images[i], i]);
    }

    for (const size of p.sizes) {
      await sql.query(`
        INSERT INTO "ProductSize" ("id","productId","size") VALUES ($1,$2,$3)
      `, [cuid(), pid, size]);
    }

    for (const { color, hex } of p.colors) {
      await sql.query(`
        INSERT INTO "ProductColor" ("id","productId","color","hex") VALUES ($1,$2,$3,$4)
      `, [cuid(), pid, color, hex]);
    }

    process.stdout.write(`  ✅ ${p.name}\n`);
  }

  console.log("\n🎉 Seed complete!");
  console.log("─────────────────────────────────");
  console.log("Admin:    admin@stylehub.com / admin123");
  console.log("Customer: customer@stylehub.com / customer123");
  console.log("─────────────────────────────────");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
