import "dotenv/config";
import { defineConfig } from "prisma/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // @ts-ignore — adapter API and Pool types differ across package versions
  adapter: () => {
    const pool = new Pool({ connectionString: process.env["DATABASE_URL"]! });
    return new PrismaNeon(pool);
  },
});
