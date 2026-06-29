import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { createHash, randomBytes } from "crypto";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

neonConfig.webSocketConstructor = ws;

const sql = neon(process.env.DATABASE_URL);

function cuid() {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(8).toString("hex");
  return `c${timestamp}${random}`;
}

async function main() {
  const now = new Date().toISOString();

  // Rename "new" category to "Sports"
  await sql.query(`
    UPDATE "Category" SET "name" = 'Sports', "slug" = 'sports', "updatedAt" = $1
    WHERE "slug" = 'new'
  `, [now]);
  console.log("✅ Category renamed to Sports");

  // Get category id
  const [cat] = await sql.query(`SELECT "id" FROM "Category" WHERE "slug" = 'sports'`);
  if (!cat) { console.error("❌ Sports category not found"); process.exit(1); }
  const catId = cat.id;

  const products = [
    {
      name: "Men's Running Shorts",
      slug: "mens-running-shorts",
      description: "Lightweight running shorts with built-in liner and moisture-wicking fabric. Ideal for all training intensities.",
      price: 44.99, discountPrice: 34.99, stock: 120, sku: "MRS-031",
      featured: true,
      image: "/uploads/sports-running-shorts.jpg",
      sizes: ["S","M","L","XL","XXL"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Navy", hex: "#1B2A4A" }, { color: "Red", hex: "#DC143C" }],
    },
    {
      name: "Sports Compression Tee",
      slug: "sports-compression-tee",
      description: "Form-fitting compression tee with four-way stretch and anti-odor treatment. Supports muscles during high-performance workouts.",
      price: 39.99, stock: 100, sku: "SCT-032",
      featured: false,
      image: "/uploads/sports-compression-tee.jpg",
      sizes: ["S","M","L","XL","XXL"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Grey", hex: "#808080" }],
    },
    {
      name: "Women's Performance Leggings",
      slug: "womens-performance-leggings",
      description: "High-performance leggings with squat-proof fabric and wide waistband. Perfect for gym, yoga, or running.",
      price: 59.99, discountPrice: 49.99, stock: 90, sku: "WPL-033",
      featured: true,
      image: "/uploads/sports-leggings.jpg",
      sizes: ["XS","S","M","L","XL"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Charcoal", hex: "#36454F" }, { color: "Plum", hex: "#8E4585" }],
    },
    {
      name: "Sports Gym Duffel Bag",
      slug: "sports-gym-duffel-bag",
      description: "Spacious gym duffel with wet-dry compartment, shoe pocket, and adjustable shoulder strap. Built for athletes on the go.",
      price: 69.99, stock: 60, sku: "SGD-034",
      featured: false,
      image: "/uploads/sports-gym-bag.jpg",
      sizes: ["One Size"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Navy", hex: "#1B2A4A" }],
    },
    {
      name: "Athletic Zip-Up Track Jacket",
      slug: "athletic-zip-up-track-jacket",
      description: "Slim-fit track jacket with full zip and side pockets. Breathable fabric keeps you comfortable during warm-ups and cool-downs.",
      price: 84.99, discountPrice: 69.99, stock: 75, sku: "AZT-035",
      featured: true,
      image: "/uploads/sports-track-jacket.jpg",
      sizes: ["S","M","L","XL","XXL"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Royal Blue", hex: "#4169E1" }, { color: "Forest Green", hex: "#228B22" }],
    },
  ];

  for (const p of products) {
    const pid = cuid();
    const result = await sql.query(`
      INSERT INTO "Product" ("id","name","slug","description","price","discountPrice","stock","sku","status","featured","categoryId","createdAt","updatedAt")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'ACTIVE',$9,$10,$11,$11)
      ON CONFLICT ("slug") DO NOTHING RETURNING "id"
    `, [pid, p.name, p.slug, p.description, p.price, p.discountPrice ?? null, p.stock, p.sku, p.featured, catId, now]);

    if (result.length === 0) { console.log(`  ⏭️  ${p.name} (already exists)`); continue; }

    const insertedId = result[0].id;
    await sql.query(`INSERT INTO "ProductImage" ("id","productId","imageUrl","order") VALUES ($1,$2,$3,0)`,
      [cuid(), insertedId, p.image]);

    for (const size of p.sizes) {
      await sql.query(`INSERT INTO "ProductSize" ("id","productId","size") VALUES ($1,$2,$3)`, [cuid(), insertedId, size]);
    }
    for (const { color, hex } of p.colors) {
      await sql.query(`INSERT INTO "ProductColor" ("id","productId","color","hex") VALUES ($1,$2,$3,$4)`, [cuid(), insertedId, color, hex]);
    }
    console.log(`  ✅ ${p.name}`);
  }

  console.log("\n🎉 Done! Sports category renamed and 5 products added.");
}

main().catch((err) => { console.error("❌ Failed:", err.message); process.exit(1); });
