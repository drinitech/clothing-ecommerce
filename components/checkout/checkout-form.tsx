"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { shippingAddressSchema, ShippingAddressInput } from "@/lib/validations"
import { useCart, useCartTotal } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import axios from "axios"
import Image from "next/image"

export default function CheckoutForm() {
  const [loading, setLoading] = useState(false)
  const { items, setItems } = useCart()
  const total = useCartTotal()
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<ShippingAddressInput>({
    resolver: zodResolver(shippingAddressSchema),
  })

  const onSubmit = async (shippingAddress: ShippingAddressInput) => {
    setLoading(true)
    try {
      const { data } = await axios.post("/api/orders", { shippingAddress })
      setItems([])
      toast.success("Order placed successfully!")
      router.push(`/orders`)
    } catch {
      toast.error("Failed to place order")
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-muted-foreground">Your cart is empty</p>
        <Button className="mt-4" onClick={() => router.push("/products")}>Shop Now</Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Shipping form */}
      <div>
        <Card>
          <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
          <CardContent>
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {[
                { id: "fullName", label: "Full Name", placeholder: "John Doe" },
                { id: "address", label: "Address", placeholder: "123 Main St" },
                { id: "city", label: "City", placeholder: "New York" },
                { id: "state", label: "State", placeholder: "NY" },
                { id: "zipCode", label: "ZIP Code", placeholder: "10001" },
                { id: "country", label: "Country", placeholder: "United States" },
                { id: "phone", label: "Phone", placeholder: "+1 555 000 0000" },
              ].map(({ id, label, placeholder }) => (
                <div key={id}>
                  <Label htmlFor={id}>{label}</Label>
                  <Input id={id} placeholder={placeholder} {...register(id as keyof ShippingAddressInput)} className="mt-1" />
                  {errors[id as keyof typeof errors] && (
                    <p className="text-xs text-destructive mt-1">{errors[id as keyof typeof errors]?.message}</p>
                  )}
                </div>
              ))}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Order summary */}
      <div>
        <Card>
          <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => {
              const img = item.product.images[0]?.imageUrl
              const price = Number(item.product.discountPrice ?? item.product.price)
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-14 rounded-md overflow-hidden bg-muted shrink-0">
                    {img && <Image src={img} alt={item.product.name} fill className="object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                      {item.size && ` · ${item.size}`}
                      {item.color && ` · ${item.color}`}
                    </p>
                    <p className="text-sm font-semibold mt-1">{formatPrice(price * item.quantity)}</p>
                  </div>
                </div>
              )
            })}

            <Separator />

            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span><span>{total >= 75 ? "Free" : formatPrice(9.99)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>{formatPrice(total >= 75 ? total : total + 9.99)}</span>
              </div>
            </div>

            <Button type="submit" form="checkout-form" className="w-full" size="lg" disabled={loading}>
              {loading ? "Placing Order..." : "Place Order"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              This is a demo store. No real payment is processed.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
