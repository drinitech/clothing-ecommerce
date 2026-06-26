"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import axios from "axios"

const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]

export default function AdminOrderActions({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter()

  const handleChange = async (status: string | null) => {
    if (!status) return
    try {
      await axios.patch("/api/admin/orders", { orderId, status })
      toast.success("Order status updated")
      router.refresh()
    } catch {
      toast.error("Failed to update order")
    }
  }

  return (
    <Select defaultValue={currentStatus} onValueChange={handleChange}>
      <SelectTrigger className="h-8 text-xs w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}
