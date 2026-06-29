import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });
neonConfig.webSocketConstructor = ws;
const sql = neon(process.env.DATABASE_URL);

const rows = await sql.query(`
  SELECT c.slug as cat, p.name, pi."imageUrl"
  FROM "Product" p
  JOIN "ProductImage" pi ON pi."productId" = p.id
  JOIN "Category" c ON c.id = p."categoryId"
  WHERE c.slug IN ('bags','jackets','swimwear','formal')
  ORDER BY c.slug, p.name
`);

rows.forEach(r => console.log(r.cat.padEnd(10) + r.imageUrl.padEnd(45) + r.name));
