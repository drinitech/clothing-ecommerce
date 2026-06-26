import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { config } from "dotenv";

config();
neonConfig.webSocketConstructor = ws;

const sql = neon(process.env.DATABASE_URL);

const statements = [
  // Enums (use DO blocks for IF NOT EXISTS equivalent)
  `DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('ADMIN', 'CUSTOMER'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
  `DO $$ BEGIN CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
  `DO $$ BEGIN CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE'); EXCEPTION WHEN duplicate_object THEN null; END $$`,

  // User
  `CREATE TABLE IF NOT EXISTS "User" (
    "id"            TEXT NOT NULL PRIMARY KEY,
    "name"          TEXT,
    "email"         TEXT NOT NULL UNIQUE,
    "emailVerified" TIMESTAMP(3),
    "password"      TEXT,
    "role"          "Role" NOT NULL DEFAULT 'CUSTOMER',
    "image"         TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email")`,

  // Account
  `CREATE TABLE IF NOT EXISTS "Account" (
    "id"                TEXT NOT NULL PRIMARY KEY,
    "userId"            TEXT NOT NULL,
    "type"              TEXT NOT NULL,
    "provider"          TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token"     TEXT,
    "access_token"      TEXT,
    "expires_at"        INTEGER,
    "token_type"        TEXT,
    "scope"             TEXT,
    "id_token"          TEXT,
    "session_state"     TEXT,
    UNIQUE("provider", "providerAccountId"),
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId")`,

  // Session
  `CREATE TABLE IF NOT EXISTS "Session" (
    "id"           TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId"       TEXT NOT NULL,
    "expires"      TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId")`,

  // VerificationToken
  `CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token"      TEXT NOT NULL UNIQUE,
    "expires"    TIMESTAMP(3) NOT NULL,
    UNIQUE("identifier", "token")
  )`,

  // Category
  `CREATE TABLE IF NOT EXISTS "Category" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "name"      TEXT NOT NULL UNIQUE,
    "slug"      TEXT NOT NULL UNIQUE,
    "image"     TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "Category_slug_idx" ON "Category"("slug")`,

  // Product
  `CREATE TABLE IF NOT EXISTS "Product" (
    "id"            TEXT NOT NULL PRIMARY KEY,
    "name"          TEXT NOT NULL,
    "slug"          TEXT NOT NULL UNIQUE,
    "description"   TEXT NOT NULL,
    "price"         DECIMAL(10,2) NOT NULL,
    "discountPrice" DECIMAL(10,2),
    "stock"         INTEGER NOT NULL DEFAULT 0,
    "sku"           TEXT NOT NULL UNIQUE,
    "status"        "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "featured"      BOOLEAN NOT NULL DEFAULT false,
    "categoryId"    TEXT NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "Product_slug_idx" ON "Product"("slug")`,
  `CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId")`,
  `CREATE INDEX IF NOT EXISTS "Product_featured_idx" ON "Product"("featured")`,
  `CREATE INDEX IF NOT EXISTS "Product_status_idx" ON "Product"("status")`,

  // ProductImage
  `CREATE TABLE IF NOT EXISTS "ProductImage" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "imageUrl"  TEXT NOT NULL,
    "order"     INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "ProductImage_productId_idx" ON "ProductImage"("productId")`,

  // ProductSize
  `CREATE TABLE IF NOT EXISTS "ProductSize" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "size"      TEXT NOT NULL,
    CONSTRAINT "ProductSize_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "ProductSize_productId_idx" ON "ProductSize"("productId")`,

  // ProductColor
  `CREATE TABLE IF NOT EXISTS "ProductColor" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "color"     TEXT NOT NULL,
    "hex"       TEXT,
    CONSTRAINT "ProductColor_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "ProductColor_productId_idx" ON "ProductColor"("productId")`,

  // CartItem
  `CREATE TABLE IF NOT EXISTS "CartItem" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "userId"    TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity"  INTEGER NOT NULL DEFAULT 1,
    "size"      TEXT,
    "color"     TEXT,
    UNIQUE("userId", "productId", "size", "color"),
    CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "CartItem_userId_idx" ON "CartItem"("userId")`,

  // WishlistItem
  `CREATE TABLE IF NOT EXISTS "WishlistItem" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "userId"    TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    UNIQUE("userId", "productId"),
    CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "WishlistItem_userId_idx" ON "WishlistItem"("userId")`,

  // Order
  `CREATE TABLE IF NOT EXISTS "Order" (
    "id"              TEXT NOT NULL PRIMARY KEY,
    "userId"          TEXT NOT NULL,
    "totalAmount"     DECIMAL(10,2) NOT NULL,
    "status"          "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "shippingAddress" JSONB NOT NULL,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId")`,
  `CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status")`,

  // OrderItem
  `CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "orderId"   TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity"  INTEGER NOT NULL,
    "price"     DECIMAL(10,2) NOT NULL,
    "size"      TEXT,
    "color"     TEXT,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId")`,

  // Review
  `CREATE TABLE IF NOT EXISTS "Review" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "userId"    TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rating"    INTEGER NOT NULL,
    "comment"   TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "productId"),
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
    CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "Review_productId_idx" ON "Review"("productId")`,

  // Prisma migration tracking
  `CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                  TEXT NOT NULL PRIMARY KEY,
    "checksum"            TEXT NOT NULL,
    "finished_at"         TIMESTAMPTZ,
    "migration_name"      TEXT NOT NULL,
    "logs"                TEXT,
    "rolled_back_at"      TIMESTAMPTZ,
    "started_at"          TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
  )`,
  `INSERT INTO "_prisma_migrations" ("id","checksum","finished_at","migration_name","applied_steps_count")
   VALUES (gen_random_uuid()::text,'manual','now()','20260625000000_init',1)
   ON CONFLICT DO NOTHING`,
];

console.log("🔌 Connecting to NeonDB via WebSocket...");

let count = 0;
for (const stmt of statements) {
  try {
    await sql.query(stmt);
    count++;
    process.stdout.write(".");
  } catch (err) {
    console.error(`\n❌ Failed on statement:\n${stmt.slice(0, 80)}...\nError: ${err.message}`);
    process.exit(1);
  }
}

console.log(`\n✅ Migration complete! ${count} statements executed.`);
console.log("📦 Tables: User, Account, Session, VerificationToken, Category, Product,");
console.log("           ProductImage, ProductSize, ProductColor, CartItem, WishlistItem,");
console.log("           Order, OrderItem, Review");
