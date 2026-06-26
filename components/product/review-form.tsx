"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import axios from "axios"

export default function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) { toast.error("Please select a rating"); return }
    setLoading(true)
    try {
      await axios.post("/api/reviews", { productId, rating, comment })
      toast.success("Review submitted!")
      setRating(0)
      setComment("")
    } catch {
      toast.error("Failed to submit review")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-3 bg-muted/30">
      <p className="font-medium">Write a Review</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}>
            <Star className={cn("h-6 w-6 transition-colors", (hover || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)"
        className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <Button type="submit" size="sm" disabled={loading}>Submit Review</Button>
    </form>
  )
}
