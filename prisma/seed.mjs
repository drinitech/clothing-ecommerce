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

    const [row] = await sql.query(`SELECT "id" FROM "Category" WHERE "slug" = $1`, [cat.slug]);
    categoryIds[cat.slug] = row.id;
  }

  console.log("✅ Categories created:", Object.keys(categoryIds).join(", "));

  // --- Products ---
  const products = [
    // ── MEN ──────────────────────────────────────────────────────────
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
      name: "Wool Blend Overcoat",
      slug: "wool-blend-overcoat",
      description: "Premium wool blend overcoat for the colder months. Tailored fit with two-button closure.",
      price: 249.99, stock: 30, sku: "WBO-008",
      category: "men", featured: true,
      images: ["https://images.unsplash.com/photo-1548864734-3b8c42c71db6?w=600&q=80"],
      sizes: ["S","M","L","XL"],
      colors: [{ color: "Camel", hex: "#C19A6B" }, { color: "Grey", hex: "#808080" }],
    },
    {
      name: "Oxford Button-Down Shirt",
      slug: "oxford-button-down-shirt",
      description: "Classic Oxford weave button-down shirt. Crisp, breathable, and perfect for smart-casual looks.",
      price: 59.99, stock: 90, sku: "OBS-009",
      category: "men", featured: false,
      images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80"],
      sizes: ["S","M","L","XL","XXL"],
      colors: [{ color: "Light Blue", hex: "#ADD8E6" }, { color: "White", hex: "#FFFFFF" }, { color: "Pink", hex: "#FFB6C1" }],
    },
    {
      name: "Denim Jacket Vintage",
      slug: "denim-jacket-vintage",
      description: "Washed denim jacket with a vintage feel. A wardrobe staple that pairs with everything.",
      price: 119.99, discountPrice: 94.99, stock: 55, sku: "DJV-010",
      category: "men", featured: true,
      images: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80"],
      sizes: ["S","M","L","XL"],
      colors: [{ color: "Mid Wash", hex: "#4A708B" }, { color: "Dark Wash", hex: "#1C2B40" }],
    },
    {
      name: "Athletic Jogger Pants",
      slug: "athletic-jogger-pants",
      description: "Comfortable jogger pants with tapered fit and elasticated waist. Great for gym or lounging.",
      price: 54.99, discountPrice: 44.99, stock: 110, sku: "AJP-011",
      category: "men", featured: false,
      images: ["https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80"],
      sizes: ["S","M","L","XL","XXL"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Grey", hex: "#808080" }, { color: "Navy", hex: "#1B2A4A" }],
    },
    {
      name: "Classic Polo Shirt",
      slug: "classic-polo-shirt",
      description: "Premium piqué polo shirt with ribbed collar and cuffs. Smart-casual perfection.",
      price: 49.99, stock: 120, sku: "CPS-012",
      category: "men", featured: false,
      images: ["https://images.unsplash.com/photo-1625910513329-5f42d29b7e4a?w=600&q=80"],
      sizes: ["S","M","L","XL","XXL"],
      colors: [{ color: "Navy", hex: "#1B2A4A" }, { color: "White", hex: "#FFFFFF" }, { color: "Forest Green", hex: "#228B22" }],
    },
    {
      name: "Cargo Shorts",
      slug: "cargo-shorts",
      description: "Durable cargo shorts with multiple pockets. Ideal for outdoor adventures.",
      price: 44.99, stock: 85, sku: "CGS-013",
      category: "men", featured: false,
      images: ["https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&q=80"],
      sizes: ["30","32","34","36","38"],
      colors: [{ color: "Olive", hex: "#808000" }, { color: "Khaki", hex: "#C3B091" }, { color: "Black", hex: "#000000" }],
    },
    {
      name: "Formal Suit Blazer",
      slug: "formal-suit-blazer",
      description: "Tailored single-breasted blazer in premium fabric. Timeless elegance for any formal occasion.",
      price: 189.99, stock: 25, sku: "FSB-014",
      category: "men", featured: true,
      images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80"],
      sizes: ["S","M","L","XL"],
      colors: [{ color: "Charcoal", hex: "#36454F" }, { color: "Navy", hex: "#1B2A4A" }],
    },

    // ── WOMEN ─────────────────────────────────────────────────────────
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
      name: "Elegant Wrap Blouse",
      slug: "elegant-wrap-blouse",
      description: "Flowing wrap blouse in soft satin fabric. Effortlessly chic for work or evenings out.",
      price: 54.99, stock: 70, sku: "EWB-015",
      category: "women", featured: false,
      images: ["https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80"],
      sizes: ["XS","S","M","L","XL"],
      colors: [{ color: "Ivory", hex: "#FFFFF0" }, { color: "Blush", hex: "#FFB6C1" }, { color: "Sage", hex: "#B2AC88" }],
    },
    {
      name: "High-Rise Skinny Jeans",
      slug: "high-rise-skinny-jeans",
      description: "Flattering high-rise skinny jeans with stretch denim for all-day comfort.",
      price: 84.99, discountPrice: 69.99, stock: 95, sku: "HRS-016",
      category: "women", featured: true,
      images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80"],
      sizes: ["24","26","28","30","32"],
      colors: [{ color: "Mid Blue", hex: "#4A708B" }, { color: "Black", hex: "#000000" }, { color: "White", hex: "#FFFFFF" }],
    },
    {
      name: "Oversized Knit Sweater",
      slug: "oversized-knit-sweater",
      description: "Cozy oversized sweater knit from soft merino blend. Perfect for layering in cooler months.",
      price: 74.99, stock: 65, sku: "OKS-017",
      category: "women", featured: true,
      images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80"],
      sizes: ["XS","S","M","L"],
      colors: [{ color: "Cream", hex: "#FFFDD0" }, { color: "Dusty Rose", hex: "#DCAE96" }, { color: "Camel", hex: "#C19A6B" }],
    },
    {
      name: "Boho Maxi Skirt",
      slug: "boho-maxi-skirt",
      description: "Flowy boho-style maxi skirt with tiered layers. Free-spirited and effortlessly stylish.",
      price: 64.99, stock: 50, sku: "BMS-018",
      category: "women", featured: false,
      images: ["https://images.unsplash.com/photo-1583496661160-fb5974574b04?w=600&q=80"],
      sizes: ["XS","S","M","L","XL"],
      colors: [{ color: "Terracotta", hex: "#E2725B" }, { color: "Olive", hex: "#808000" }],
    },
    {
      name: "Women's Blazer",
      slug: "womens-blazer",
      description: "Structured women's blazer with a modern slim cut. Sharp, professional, and versatile.",
      price: 129.99, discountPrice: 99.99, stock: 40, sku: "WBL-019",
      category: "women", featured: true,
      images: ["https://images.unsplash.com/photo-1594938298603-c8148c4b4aab?w=600&q=80"],
      sizes: ["XS","S","M","L","XL"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Cream", hex: "#FFFDD0" }],
    },
    {
      name: "Denim Shorts Women",
      slug: "denim-shorts-women",
      description: "Classic denim shorts with a relaxed fit. A summer wardrobe essential.",
      price: 49.99, stock: 80, sku: "DSW-020",
      category: "women", featured: false,
      images: ["https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80"],
      sizes: ["XS","S","M","L","XL"],
      colors: [{ color: "Light Wash", hex: "#B0C4DE" }, { color: "Dark Wash", hex: "#1C2B40" }],
    },

    // ── KIDS ──────────────────────────────────────────────────────────
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
      name: "Kids Denim Overalls",
      slug: "kids-denim-overalls",
      description: "Adorable and durable denim overalls for active kids. Adjustable straps and reinforced knees.",
      price: 42.99, stock: 60, sku: "KDO-021",
      category: "kids", featured: false,
      images: ["https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80"],
      sizes: ["2T","3T","4T","5T","6T"],
      colors: [{ color: "Mid Blue", hex: "#4A708B" }],
    },
    {
      name: "Kids Sports Tracksuit",
      slug: "kids-sports-tracksuit",
      description: "Comfortable matching tracksuit set for active kids. Soft fleece lining for warmth.",
      price: 55.00, stock: 65, sku: "KST-022",
      category: "kids", featured: true,
      images: ["https://images.unsplash.com/photo-1518831959646-742c3a14ebf6?w=600&q=80"],
      sizes: ["XS","S","M","L"],
      colors: [{ color: "Navy", hex: "#1B2A4A" }, { color: "Red", hex: "#DC143C" }, { color: "Black", hex: "#000000" }],
    },
    {
      name: "Girls Party Dress",
      slug: "girls-party-dress",
      description: "Sparkling tulle party dress perfect for birthdays and special occasions. Includes sash belt.",
      price: 48.99, stock: 40, sku: "GPD-023",
      category: "kids", featured: false,
      images: ["https://images.unsplash.com/photo-1476234251651-f353703a034d?w=600&q=80"],
      sizes: ["2T","3T","4T","5T","6T"],
      colors: [{ color: "Pink", hex: "#FFB6C1" }, { color: "Purple", hex: "#800080" }],
    },

    // ── SHOES ─────────────────────────────────────────────────────────
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
      name: "Classic Oxford Shoes",
      slug: "classic-oxford-shoes",
      description: "Handcrafted full-grain leather Oxford shoes. A timeless dress shoe for any formal occasion.",
      price: 149.99, stock: 35, sku: "COS-024",
      category: "shoes", featured: true,
      images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80"],
      sizes: ["40","41","42","43","44","45","46"],
      colors: [{ color: "Tan", hex: "#D2B48C" }, { color: "Black", hex: "#000000" }],
    },
    {
      name: "Platform Sneakers",
      slug: "platform-sneakers",
      description: "Chunky platform sneakers with extra height and bold streetwear aesthetic.",
      price: 89.99, stock: 50, sku: "PLS-025",
      category: "shoes", featured: false,
      images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80"],
      sizes: ["36","37","38","39","40","41"],
      colors: [{ color: "White", hex: "#FFFFFF" }, { color: "Black", hex: "#000000" }],
    },
    {
      name: "Ankle Boots Suede",
      slug: "ankle-boots-suede",
      description: "Soft suede ankle boots with block heel. Stylish and comfortable for everyday wear.",
      price: 139.99, discountPrice: 109.99, stock: 40, sku: "ABS-026",
      category: "shoes", featured: true,
      images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80"],
      sizes: ["36","37","38","39","40","41"],
      colors: [{ color: "Cognac", hex: "#9A4722" }, { color: "Black", hex: "#000000" }, { color: "Taupe", hex: "#8B7D7B" }],
    },

    // ── ACCESSORIES ───────────────────────────────────────────────────
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
      name: "Canvas Tote Bag",
      slug: "canvas-tote-bag",
      description: "Spacious canvas tote bag with interior pockets. Eco-friendly and stylish for daily use.",
      price: 34.99, stock: 150, sku: "CTB-027",
      category: "accessories", featured: false,
      images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80"],
      sizes: ["One Size"],
      colors: [{ color: "Natural", hex: "#F5F5DC" }, { color: "Black", hex: "#000000" }, { color: "Navy", hex: "#1B2A4A" }],
    },
    {
      name: "Aviator Sunglasses",
      slug: "aviator-sunglasses",
      description: "Classic aviator sunglasses with UV400 protection and metal frame. Timeless cool.",
      price: 29.99, stock: 180, sku: "AVS-028",
      category: "accessories", featured: false,
      images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80"],
      sizes: ["One Size"],
      colors: [{ color: "Gold/Green", hex: "#DAA520" }, { color: "Silver/Blue", hex: "#C0C0C0" }],
    },
    {
      name: "Leather Wallet Slim",
      slug: "leather-wallet-slim",
      description: "Minimalist slim wallet in genuine leather. Holds cards and cash without the bulk.",
      price: 44.99, stock: 130, sku: "LWS-029",
      category: "accessories", featured: false,
      images: ["https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&q=80"],
      sizes: ["One Size"],
      colors: [{ color: "Dark Brown", hex: "#3B1A08" }, { color: "Black", hex: "#000000" }],
    },
    {
      name: "Wool Knit Beanie",
      slug: "wool-knit-beanie",
      description: "Soft wool-blend beanie with ribbed knit texture. Keeps you warm in style.",
      price: 24.99, stock: 200, sku: "WKB-030",
      category: "accessories", featured: false,
      images: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80"],
      sizes: ["One Size"],
      colors: [{ color: "Charcoal", hex: "#36454F" }, { color: "Cream", hex: "#FFFDD0" }, { color: "Burgundy", hex: "#800020" }],
    },
  ];

  let inserted = 0, skipped = 0;

  for (const p of products) {
    const productId = cuid();
    const catId = categoryIds[p.category];

    // Use RETURNING to detect if the row was freshly inserted
    const result = await sql.query(`
      INSERT INTO "Product" ("id","name","slug","description","price","discountPrice","stock","sku","status","featured","categoryId","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'ACTIVE',$9,$10,$11,$11)
      ON CONFLICT ("slug") DO NOTHING
      RETURNING "id"
    `, [productId, p.name, p.slug, p.description, p.price, p.discountPrice ?? null,
        p.stock, p.sku, p.featured, catId, now]);

    if (result.length === 0) {
      process.stdout.write(`  ⏭️  ${p.name} (already exists)\n`);
      skipped++;
      continue;
    }

    const pid = result[0].id;

    for (let i = 0; i < p.images.length; i++) {
      await sql.query(`
        INSERT INTO "ProductImage" ("id","productId","imageUrl","order")
        VALUES ($1,$2,$3,$4)
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
      `, [cuid(), pid, color, hex ?? null]);
    }

    process.stdout.write(`  ✅ ${p.name}\n`);
    inserted++;
  }

  console.log(`\n🎉 Seed complete! ${inserted} inserted, ${skipped} skipped.`);
  console.log("─────────────────────────────────");
  console.log("Admin:    admin@stylehub.com / admin123");
  console.log("Customer: customer@stylehub.com / customer123");
  console.log("─────────────────────────────────");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
