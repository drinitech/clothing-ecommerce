import CheckoutForm from "@/components/checkout/checkout-form"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Checkout" }

export default async function CheckoutPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/checkout")

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <CheckoutForm />
    </div>
  )
}
