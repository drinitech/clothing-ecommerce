import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { randomBytes } from "crypto";
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

  // --- Categories ---
  const cats = [
    { name: "Bags",     slug: "bags" },
    { name: "Jackets",  slug: "jackets" },
    { name: "Swimwear", slug: "swimwear" },
    { name: "Formal",   slug: "formal" },
  ];

  const catIds = {};
  for (const cat of cats) {
    const id = cuid();
    await sql.query(
      `INSERT INTO "Category" ("id","name","slug","createdAt","updatedAt")
       VALUES ($1,$2,$3,$4,$4) ON CONFLICT ("slug") DO NOTHING`,
      [id, cat.name, cat.slug, now]
    );
    const [row] = await sql.query(`SELECT "id" FROM "Category" WHERE "slug"=$1`, [cat.slug]);
    catIds[cat.slug] = row.id;
    console.log(`✅ Category: ${cat.name} (${row.id})`);
  }

  // --- Products ---
  const products = [
    // ── BAGS ─────────────────────────────────────────────────────────
    {
      name: "Leather Shoulder Bag", slug: "leather-shoulder-bag",
      description: "Timeless full-grain leather shoulder bag with gold-tone hardware and spacious interior. Perfect for daily use or weekends out.",
      price: 89.99, discountPrice: null, stock: 80, sku: "LSB-036", cat: "bags", featured: true,
      image: "/uploads/bags-shoulder-bag.jpg",
      sizes: ["One Size"],
      colors: [{ color: "Brown", hex: "#8B4513" }, { color: "Black", hex: "#000000" }],
    },
    {
      name: "Mini Crossbody Bag", slug: "mini-crossbody-bag",
      description: "Compact crossbody bag with adjustable strap. Holds your essentials in style — phone, cards, keys.",
      price: 59.99, discountPrice: 49.99, stock: 110, sku: "MCB-037", cat: "bags", featured: false,
      image: "/uploads/bags-crossbody.jpg",
      sizes: ["One Size"],
      colors: [{ color: "Tan", hex: "#D2B48C" }, { color: "Black", hex: "#000000" }, { color: "Blush", hex: "#FFB6C1" }],
    },
    {
      name: "Structured Work Tote", slug: "structured-work-tote",
      description: "Professional tote with structured silhouette, laptop sleeve, and magnetic closure. Carry everything in one elegant bag.",
      price: 99.99, discountPrice: null, stock: 65, sku: "SWT-038", cat: "bags", featured: true,
      image: "/uploads/bags-work-tote.jpg",
      sizes: ["One Size"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Camel", hex: "#C19A6B" }],
    },
    {
      name: "Everyday Backpack", slug: "everyday-backpack",
      description: "Versatile everyday backpack with padded shoulder straps, multiple compartments, and a water-resistant exterior.",
      price: 109.99, discountPrice: 89.99, stock: 90, sku: "EBP-039", cat: "bags", featured: true,
      image: "/uploads/bags-backpack.jpg",
      sizes: ["One Size"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Grey", hex: "#808080" }, { color: "Navy", hex: "#1B2A4A" }],
    },
    {
      name: "Evening Clutch", slug: "evening-clutch",
      description: "Elegant envelope clutch with chain strap for evenings out. Features a mirror, card slots, and zip closure.",
      price: 49.99, discountPrice: null, stock: 70, sku: "EVC-040", cat: "bags", featured: false,
      image: "/uploads/bags-evening-clutch.jpg",
      sizes: ["One Size"],
      colors: [{ color: "Gold", hex: "#FFD700" }, { color: "Silver", hex: "#C0C0C0" }, { color: "Black", hex: "#000000" }],
    },
    {
      name: "Belt Bag / Fanny Pack", slug: "belt-bag-fanny-pack",
      description: "Sporty-chic belt bag worn around the waist or over the shoulder. Adjustable strap and zip pocket.",
      price: 44.99, discountPrice: null, stock: 120, sku: "BBF-041", cat: "bags", featured: false,
      image: "/uploads/bags-belt-bag.jpg",
      sizes: ["One Size"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Olive", hex: "#808000" }],
    },
    {
      name: "Weekend Duffle", slug: "weekend-duffle",
      description: "Spacious weekend duffle in durable canvas with leather handles. Fits a 2–3 day trip comfortably.",
      price: 129.99, discountPrice: 99.99, stock: 50, sku: "WKD-042", cat: "bags", featured: true,
      image: "/uploads/bags-weekender.jpg",
      sizes: ["One Size"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Brown", hex: "#8B4513" }],
    },
    {
      name: "Laptop Backpack Pro", slug: "laptop-backpack-pro",
      description: "Anti-theft laptop backpack with USB charging port, 15.6\" laptop sleeve, and organized compartments for commuters.",
      price: 119.99, discountPrice: null, stock: 75, sku: "LBP-043", cat: "bags", featured: false,
      image: "/uploads/bags-laptop-backpack.jpg",
      sizes: ["One Size"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Charcoal", hex: "#36454F" }],
    },
    {
      name: "Straw Beach Bag", slug: "straw-beach-bag",
      description: "Handwoven straw tote with cotton lining and magnetic snap. Light, airy, and perfect for the beach or market.",
      price: 39.99, discountPrice: null, stock: 95, sku: "SBB-044", cat: "bags", featured: false,
      image: "/uploads/bags-beach-bag.jpg",
      sizes: ["One Size"],
      colors: [{ color: "Natural", hex: "#F5F5DC" }, { color: "Black", hex: "#000000" }],
    },
    {
      name: "Velvet Mini Bag", slug: "velvet-mini-bag",
      description: "Luxurious velvet mini bag with pearl chain strap and gold hardware. A statement piece for any outfit.",
      price: 54.99, discountPrice: 44.99, stock: 60, sku: "VMB-045", cat: "bags", featured: true,
      image: "/uploads/bags-velvet-mini.jpg",
      sizes: ["One Size"],
      colors: [{ color: "Dusty Rose", hex: "#DCAE96" }, { color: "Black", hex: "#000000" }, { color: "Emerald", hex: "#50C878" }],
    },

    // ── JACKETS ──────────────────────────────────────────────────────
    {
      name: "Classic Bomber Jacket", slug: "classic-bomber-jacket",
      description: "Iconic MA-1 style bomber jacket in satin-finish fabric with ribbed cuffs, hem, and collar. A streetwear staple.",
      price: 109.99, discountPrice: null, stock: 85, sku: "CBJ-046", cat: "jackets", featured: true,
      image: "/uploads/jackets-bomber.jpg",
      sizes: ["S","M","L","XL"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Olive", hex: "#808000" }, { color: "Navy", hex: "#1B2A4A" }],
    },
    {
      name: "Leather Moto Jacket", slug: "leather-moto-jacket",
      description: "Genuine leather motorcycle jacket with asymmetric zip, snap lapels, and quilted lining for warmth and edge.",
      price: 199.99, discountPrice: 169.99, stock: 40, sku: "LMJ-047", cat: "jackets", featured: true,
      image: "/uploads/jackets-leather-moto.jpg",
      sizes: ["S","M","L","XL"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Brown", hex: "#8B4513" }],
    },
    {
      name: "Puffer Down Jacket", slug: "puffer-down-jacket",
      description: "Lightweight 650-fill-power down puffer jacket. Packable, warm, and water-resistant — ideal for cold adventures.",
      price: 149.99, discountPrice: null, stock: 70, sku: "PDJ-048", cat: "jackets", featured: true,
      image: "/uploads/jackets-puffer.jpg",
      sizes: ["S","M","L","XL","XXL"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Puffer Red", hex: "#C0392B" }, { color: "Cobalt Blue", hex: "#0047AB" }],
    },
    {
      name: "Windbreaker Jacket", slug: "windbreaker-jacket",
      description: "Packable windbreaker with DWR coating, elastic cuffs, and drawcord hem. Blocks wind and light rain with ease.",
      price: 79.99, discountPrice: null, stock: 100, sku: "WBJ-049", cat: "jackets", featured: false,
      image: "/uploads/jackets-windbreaker.jpg",
      sizes: ["S","M","L","XL","XXL"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Yellow", hex: "#FFD700" }, { color: "Orange", hex: "#FF6600" }],
    },
    {
      name: "Sherpa Fleece Jacket", slug: "sherpa-fleece-jacket",
      description: "Ultra-cozy sherpa fleece jacket with full zip and two side pockets. Perfect layering piece for autumn and winter.",
      price: 89.99, discountPrice: 74.99, stock: 75, sku: "SFJ-050", cat: "jackets", featured: false,
      image: "/uploads/jackets-sherpa-fleece.jpg",
      sizes: ["S","M","L","XL"],
      colors: [{ color: "Cream", hex: "#FFFDD0" }, { color: "Tan", hex: "#D2B48C" }, { color: "Black", hex: "#000000" }],
    },
    {
      name: "Double-Breasted Trench Coat", slug: "double-breasted-trench-coat",
      description: "Classic double-breasted trench coat in water-resistant cotton blend with belt, epaulettes, and storm flap.",
      price: 159.99, discountPrice: null, stock: 45, sku: "DBT-051", cat: "jackets", featured: true,
      image: "/uploads/jackets-trench-coat.jpg",
      sizes: ["S","M","L","XL"],
      colors: [{ color: "Camel", hex: "#C19A6B" }, { color: "Black", hex: "#000000" }, { color: "Navy", hex: "#1B2A4A" }],
    },
    {
      name: "Denim Trucker Jacket", slug: "denim-trucker-jacket",
      description: "Authentic washed denim trucker jacket with chest pockets and button-front closure. Pairs with everything.",
      price: 84.99, discountPrice: null, stock: 80, sku: "DTJ-052", cat: "jackets", featured: false,
      image: "/uploads/jackets-denim-trucker.jpg",
      sizes: ["S","M","L","XL"],
      colors: [{ color: "Mid Wash", hex: "#4A708B" }, { color: "Dark Wash", hex: "#1C2B40" }],
    },
    {
      name: "Parka Winter Jacket", slug: "parka-winter-jacket",
      description: "Heavyweight parka with faux-fur trim hood, down-fill insulation, and multiple pockets. Built for serious cold weather.",
      price: 179.99, discountPrice: 149.99, stock: 35, sku: "PWJ-053", cat: "jackets", featured: true,
      image: "/uploads/jackets-parka.jpg",
      sizes: ["S","M","L","XL","XXL"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Army Green", hex: "#4B5320" }, { color: "Burgundy", hex: "#800020" }],
    },
    {
      name: "Quilted Puffer Vest", slug: "quilted-puffer-vest",
      description: "Sleeveless quilted vest with down filling and stand collar. Core warmth without restricting arm movement.",
      price: 69.99, discountPrice: null, stock: 90, sku: "QPV-054", cat: "jackets", featured: false,
      image: "/uploads/jackets-puffer-vest.jpg",
      sizes: ["S","M","L","XL"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Navy", hex: "#1B2A4A" }, { color: "Cream", hex: "#FFFDD0" }],
    },
    {
      name: "Military Field Jacket", slug: "military-field-jacket",
      description: "M65-inspired field jacket in durable cotton-poly blend with four cargo pockets and button-in liner.",
      price: 119.99, discountPrice: null, stock: 60, sku: "MFJ-055", cat: "jackets", featured: false,
      image: "/uploads/jackets-military.jpg",
      sizes: ["S","M","L","XL"],
      colors: [{ color: "Olive", hex: "#808000" }, { color: "Khaki", hex: "#C3B091" }, { color: "Black", hex: "#000000" }],
    },

    // ── SWIMWEAR ─────────────────────────────────────────────────────
    {
      name: "Classic Swim Trunks", slug: "classic-swim-trunks",
      description: "Quick-dry swim trunks with inner mesh brief, elastic waistband, and side pockets. A beach essential.",
      price: 44.99, discountPrice: null, stock: 120, sku: "CST-056", cat: "swimwear", featured: false,
      image: "/uploads/swimwear-swim-trunks.jpg",
      sizes: ["S","M","L","XL"],
      colors: [{ color: "Navy", hex: "#1B2A4A" }, { color: "Tropical Print", hex: "#00CED1" }, { color: "Black", hex: "#000000" }],
    },
    {
      name: "Women's Triangle Bikini Top", slug: "womens-triangle-bikini-top",
      description: "Adjustable tie-string triangle top in UPF 50+ fabric. Minimal coverage with maximum style.",
      price: 39.99, discountPrice: null, stock: 100, sku: "TBT-057", cat: "swimwear", featured: true,
      image: "/uploads/swimwear-bikini-top.jpg",
      sizes: ["XS","S","M","L"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "White", hex: "#FFFFFF" }, { color: "Coral", hex: "#FF6B6B" }],
    },
    {
      name: "Women's Bikini Bottoms", slug: "womens-bikini-bottoms",
      description: "Classic bikini bottoms with adjustable side ties and full seat coverage. Mix and match with any top.",
      price: 34.99, discountPrice: null, stock: 100, sku: "WBB-058", cat: "swimwear", featured: false,
      image: "/uploads/swimwear-bikini-bottoms.jpg",
      sizes: ["XS","S","M","L"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "White", hex: "#FFFFFF" }, { color: "Coral", hex: "#FF6B6B" }],
    },
    {
      name: "One-Piece Swimsuit", slug: "one-piece-swimsuit",
      description: "Sleek one-piece with tummy-control lining, adjustable straps, and cheeky cut. Comfortable and flattering.",
      price: 79.99, discountPrice: 64.99, stock: 75, sku: "OPS-059", cat: "swimwear", featured: true,
      image: "/uploads/swimwear-one-piece.jpg",
      sizes: ["XS","S","M","L","XL"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Navy", hex: "#1B2A4A" }, { color: "Red", hex: "#DC143C" }],
    },
    {
      name: "Men's Surf Boardshorts", slug: "mens-surf-boardshorts",
      description: "Board shorts with stretch waistband, Velcro fly, and side/back pockets. Designed for surf and shore.",
      price: 54.99, discountPrice: null, stock: 90, sku: "MSB-060", cat: "swimwear", featured: false,
      image: "/uploads/swimwear-boardshorts.jpg",
      sizes: ["S","M","L","XL","XXL"],
      colors: [{ color: "Blue Print", hex: "#4169E1" }, { color: "Grey", hex: "#808080" }, { color: "Black", hex: "#000000" }],
    },
    {
      name: "High-Waist Bikini Set", slug: "high-waist-bikini-set",
      description: "Retro-inspired high-waist bikini set with underwire top and full-coverage bottoms. Flattering for all body types.",
      price: 74.99, discountPrice: 59.99, stock: 80, sku: "HWB-061", cat: "swimwear", featured: true,
      image: "/uploads/swimwear-high-waist-bikini.jpg",
      sizes: ["XS","S","M","L"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Sage", hex: "#B2AC88" }, { color: "Terracotta", hex: "#E2725B" }],
    },
    {
      name: "Rash Guard Long Sleeve", slug: "rash-guard-long-sleeve",
      description: "UPF 50+ long-sleeve rash guard with flatlock seams and 4-way stretch. Protection from sun and surf.",
      price: 59.99, discountPrice: null, stock: 70, sku: "RGL-062", cat: "swimwear", featured: false,
      image: "/uploads/swimwear-rash-guard.jpg",
      sizes: ["XS","S","M","L","XL","XXL"],
      colors: [{ color: "Navy", hex: "#1B2A4A" }, { color: "Black", hex: "#000000" }, { color: "White", hex: "#FFFFFF" }],
    },
    {
      name: "Women's Swim Cover-Up Dress", slug: "womens-swim-cover-up-dress",
      description: "Flowy cover-up dress in sheer georgette. Slips easily over a swimsuit for beach-to-bar style.",
      price: 64.99, discountPrice: null, stock: 65, sku: "WCU-063", cat: "swimwear", featured: false,
      image: "/uploads/swimwear-cover-up.jpg",
      sizes: ["XS","S","M","L"],
      colors: [{ color: "White", hex: "#FFFFFF" }, { color: "Black", hex: "#000000" }, { color: "Sky Blue", hex: "#87CEEB" }],
    },
    {
      name: "Ruffle Bikini Top", slug: "ruffle-bikini-top",
      description: "Flirty ruffle-trim bikini top with underwire support and adjustable straps. Great for poolside looks.",
      price: 44.99, discountPrice: null, stock: 85, sku: "RBT-064", cat: "swimwear", featured: false,
      image: "/uploads/swimwear-ruffle-bikini.jpg",
      sizes: ["XS","S","M","L"],
      colors: [{ color: "Dusty Rose", hex: "#DCAE96" }, { color: "White", hex: "#FFFFFF" }, { color: "Red", hex: "#DC143C" }],
    },
    {
      name: "Men's Athletic Swim Shorts", slug: "mens-athletic-swim-shorts",
      description: "Performance swim shorts with compression liner, water-repellent fabric, and secure zip pocket.",
      price: 49.99, discountPrice: null, stock: 95, sku: "MAS-065", cat: "swimwear", featured: false,
      image: "/uploads/swimwear-athletic-shorts.jpg",
      sizes: ["S","M","L","XL"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Charcoal", hex: "#36454F" }, { color: "Navy", hex: "#1B2A4A" }],
    },

    // ── FORMAL ───────────────────────────────────────────────────────
    {
      name: "Men's Classic 2-Piece Suit", slug: "mens-classic-2-piece-suit",
      description: "Sharp single-breasted two-piece suit in premium wool-blend. Tailored fit, notch lapel, and two-button closure.",
      price: 349.99, discountPrice: 299.99, stock: 30, sku: "MC2S-066", cat: "formal", featured: true,
      image: "/uploads/formal-mens-suit.jpg",
      sizes: ["S","M","L","XL"],
      colors: [{ color: "Charcoal", hex: "#36454F" }, { color: "Navy", hex: "#1B2A4A" }, { color: "Black", hex: "#000000" }],
    },
    {
      name: "Women's Evening Gown", slug: "womens-evening-gown",
      description: "Floor-length evening gown in duchess satin with a sweetheart neckline and fitted bodice. Effortlessly elegant.",
      price: 249.99, discountPrice: null, stock: 25, sku: "WEG-067", cat: "formal", featured: true,
      image: "/uploads/formal-evening-gown.jpg",
      sizes: ["XS","S","M","L"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Emerald", hex: "#50C878" }, { color: "Burgundy", hex: "#800020" }],
    },
    {
      name: "Men's White Dress Shirt", slug: "mens-white-dress-shirt",
      description: "Crisp poplin dress shirt with spread collar, French cuffs, and mother-of-pearl buttons. The formal wardrobe cornerstone.",
      price: 79.99, discountPrice: null, stock: 100, sku: "MWD-068", cat: "formal", featured: false,
      image: "/uploads/formal-dress-shirt.jpg",
      sizes: ["S","M","L","XL","XXL"],
      colors: [{ color: "White", hex: "#FFFFFF" }, { color: "Light Blue", hex: "#ADD8E6" }],
    },
    {
      name: "Women's Cocktail Dress", slug: "womens-cocktail-dress",
      description: "Body-con midi dress with ruched detailing and V-neckline. Perfect for cocktail parties and formal evenings.",
      price: 149.99, discountPrice: 119.99, stock: 50, sku: "WCD-069", cat: "formal", featured: true,
      image: "/uploads/formal-cocktail-dress.jpg",
      sizes: ["XS","S","M","L","XL"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Red", hex: "#DC143C" }, { color: "Navy", hex: "#1B2A4A" }],
    },
    {
      name: "Men's Suit Waistcoat", slug: "mens-suit-waistcoat",
      description: "Five-button waistcoat in fine suiting fabric. Worn under a jacket or solo for a smart three-piece effect.",
      price: 89.99, discountPrice: null, stock: 55, sku: "MSW-070", cat: "formal", featured: false,
      image: "/uploads/formal-waistcoat.jpg",
      sizes: ["S","M","L","XL"],
      colors: [{ color: "Charcoal", hex: "#36454F" }, { color: "Navy", hex: "#1B2A4A" }, { color: "Black", hex: "#000000" }],
    },
    {
      name: "Women's Pencil Skirt", slug: "womens-pencil-skirt",
      description: "Classic pencil skirt in stretch crepe with hidden back slit. Polished and professional for the office or events.",
      price: 74.99, discountPrice: null, stock: 70, sku: "WPS-071", cat: "formal", featured: false,
      image: "/uploads/formal-pencil-skirt.jpg",
      sizes: ["XS","S","M","L","XL"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Navy", hex: "#1B2A4A" }, { color: "Burgundy", hex: "#800020" }],
    },
    {
      name: "Men's Tuxedo Jacket", slug: "mens-tuxedo-jacket",
      description: "Peak-lapel tuxedo jacket in luxurious satin-faced wool. The pinnacle of black-tie dressing.",
      price: 299.99, discountPrice: null, stock: 20, sku: "MTJ-072", cat: "formal", featured: true,
      image: "/uploads/formal-tuxedo.jpg",
      sizes: ["S","M","L","XL"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Midnight Blue", hex: "#003366" }],
    },
    {
      name: "Women's Formal Jumpsuit", slug: "womens-formal-jumpsuit",
      description: "Wide-leg formal jumpsuit with deep V-neck and self-tie belt. Sleek, modern, and occasion-ready.",
      price: 129.99, discountPrice: 109.99, stock: 45, sku: "WFJ-073", cat: "formal", featured: false,
      image: "/uploads/formal-jumpsuit.jpg",
      sizes: ["XS","S","M","L"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Ivory", hex: "#FFFFF0" }],
    },
    {
      name: "Men's Dress Trousers", slug: "mens-dress-trousers",
      description: "Flat-front tailored trousers in premium wool-blend with side-adjusters and extended waistband.",
      price: 99.99, discountPrice: null, stock: 60, sku: "MDT-074", cat: "formal", featured: false,
      image: "/uploads/formal-dress-trousers.jpg",
      sizes: ["30","32","34","36","38"],
      colors: [{ color: "Charcoal", hex: "#36454F" }, { color: "Black", hex: "#000000" }, { color: "Navy", hex: "#1B2A4A" }],
    },
    {
      name: "Women's Lace Midi Dress", slug: "womens-lace-midi-dress",
      description: "All-over lace midi dress with scalloped hem and lining. A delicate yet striking choice for weddings and galas.",
      price: 189.99, discountPrice: 159.99, stock: 35, sku: "WLM-075", cat: "formal", featured: true,
      image: "/uploads/formal-lace-dress.jpg",
      sizes: ["XS","S","M","L"],
      colors: [{ color: "Black", hex: "#000000" }, { color: "Blush", hex: "#FFB6C1" }, { color: "Ivory", hex: "#FFFFF0" }],
    },
  ];

  let inserted = 0, skipped = 0;

  for (const p of products) {
    const pid = cuid();
    const catId = catIds[p.cat];
    const result = await sql.query(
      `INSERT INTO "Product" ("id","name","slug","description","price","discountPrice","stock","sku","status","featured","categoryId","createdAt","updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'ACTIVE',$9,$10,$11,$11)
       ON CONFLICT ("slug") DO NOTHING RETURNING "id"`,
      [pid, p.name, p.slug, p.description, p.price, p.discountPrice ?? null,
       p.stock, p.sku, p.featured, catId, now]
    );

    if (result.length === 0) {
      process.stdout.write(`  ⏭️  ${p.name} (skipped)\n`);
      skipped++;
      continue;
    }

    const insertedId = result[0].id;

    await sql.query(
      `INSERT INTO "ProductImage" ("id","productId","imageUrl","order") VALUES ($1,$2,$3,0)`,
      [cuid(), insertedId, p.image]
    );

    for (const size of p.sizes) {
      await sql.query(
        `INSERT INTO "ProductSize" ("id","productId","size") VALUES ($1,$2,$3)`,
        [cuid(), insertedId, size]
      );
    }

    for (const { color, hex } of p.colors) {
      await sql.query(
        `INSERT INTO "ProductColor" ("id","productId","color","hex") VALUES ($1,$2,$3,$4)`,
        [cuid(), insertedId, color, hex]
      );
    }

    process.stdout.write(`  ✅ ${p.name}\n`);
    inserted++;
  }

  console.log(`\n🎉 Done! ${inserted} inserted, ${skipped} skipped.`);
}

main().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
