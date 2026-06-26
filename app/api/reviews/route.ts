import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { reviewSchema } from "@/lib/validations"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const review = await prisma.review.upsert({
      where: { userId_productId: { userId: session.user.id, productId: parsed.data.productId } },
      update: { rating: parsed.data.rating, comment: parsed.data.comment },
      create: {
        userId: session.user.id,
        productId: parsed.data.productId,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
      include: { user: { select: { id: true, name: true, image: true } } },
    })

    return NextResponse.json(review, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
