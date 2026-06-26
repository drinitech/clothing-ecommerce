import { PrismaClient } from "@prisma/client"
import { neon } from "@neondatabase/serverless"
import { PrismaNeonHttp } from "@prisma/adapter-neon"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const sql = neon(process.env.DATABASE_URL!)
  // @ts-ignore — adapter type mismatch across package versions
  const adapter = new PrismaNeonHttp(sql)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
