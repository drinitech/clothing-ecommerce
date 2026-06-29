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
  SELECT c.name, COUNT(p.id)::int as count
  FROM "Category" c
  LEFT JOIN "Product" p ON p."categoryId" = c.id
  GROUP BY c.name ORDER BY c.name
`);
let total = 0;
rows.forEach(r => { console.log(r.name.padEnd(15), r.count); total += r.count; });
console.log("─".repeat(20));
console.log("TOTAL".padEnd(15), total);
