"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Star, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface Review {
  _id: string
  user_name: string
  rating: number
  title: string
  comment: string
  pros: string[]
  cons: string[]
  helpful_votes: number
  status: "pending" | "approved" | "rejected"
  created_at: string
  product: {
    name: string
    slug: string
  }
}

export default  function AdminReviewDetailPage({ params }: { params: Promise<{ id: string }>}) {
  const router = useRouter()
  const { toast } = useToast()
  const [review, setReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [rating, setRating] = useState(0)
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending")
  const [pros, setPros] = useState<string[]>([])
  const [cons, setCons] = useState<string[]>([])
  const [id, setId] = useState("")
  useEffect(() => {
    const fetchId = async () => {
      const param = await params
      setId(param.id)
    }
    fetchId()
  }, [params])

  // Fetch review
  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/reviews/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch review")
        }

        const data = await response.json()
        setReview(data.review)

        // Initialize form state
        setTitle(data.review.title)
        setComment(data.review.comment)
        setRating(data.review.rating)
        setStatus(data.review.status)
        setPros(data.review.pros || [])
        setCons(data.review.cons || [])
      } catch (error) {
        console.error("Error fetching review:", error)
        toast({
          title: "Error",
          description: "Failed to load review",
          variant: "destructive",
        })
        router.push("/dashboard/reviews")
      } finally {
        setLoading(false)
      }
    }

    fetchReview()
  }, [id, router, toast])

  const handleProChange = (index: number, value: string) => {
    const newPros = [...pros]
    newPros[index] = value
    setPros(newPros)
  }

  const handleConChange = (index: number, value: string) => {
    const newCons = [...cons]
    newCons[index] = value
    setCons(newCons)
  }

  const handleAddPro = () => {
    setPros([...pros, ""])
  }

  const handleAddCon = () => {
    setCons([...cons, ""])
  }

  const handleRemovePro = (index: number) => {
    const newPros = [...pros]
    newPros.splice(index, 1)
    setPros(newPros)
  }

  const handleRemoveCon = (index: number) => {
    const newCons = [...cons]
    newCons.splice(index, 1)
    setCons(newCons)
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Filter out empty pros and cons
      const filteredPros = pros.filter((p) => p.trim() !== "")
      const filteredCons = cons.filter((c) => c.trim() !== "")

      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          comment,
          rating,
          status,
          pros: filteredPros,
          cons: filteredCons,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update review")
      }

      toast({
        title: "Success",
        description: "Review updated successfully",
      })

      // Update local state
      if (review) {
        setReview({
          ...review,
          title,
          comment,
          rating,
          status,
          pros: filteredPros,
          cons: filteredCons,
        })
      }
    } catch (error) {
      console.error("Error updating review:", error)
      toast({
        title: "Error",
        description: "Failed to update review",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete review")
      }

      toast({
        title: "Success",
        description: "Review deleted successfully",
      })

      router.push("/dashboard/reviews")
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      })
    }
  }

  const renderStars = (count: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button" onClick={() => setRating(star)} className="p-1">
            <Star className={`h-6 w-6 ${star <= rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  if (!review) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Review not found</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/reviews")} className="mt-4">
          Back to Reviews
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Review Details</h1>
        <Button variant="ghost" onClick={() => router.push("/dashboard/reviews")} className="mr-4 bg-teal-600 hover:bg-teal-700 text-white hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Review Info */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Review Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Product</p>
                  <p className="font-medium">
                    <Link href={`/products/${review.product.slug}`} className="text-amber-700 hover:underline">
                      {review.product.name}
                    </Link>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{review.user_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Helpful Votes</p>
                  <p className="font-medium">{review.helpful_votes}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Rating</label>
              {renderStars(rating)}
            </div>

            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title
              </label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full" />
            </div>

            <div className="mb-6">
              <label htmlFor="comment" className="block text-sm font-medium mb-2">
                Comment
              </label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={6}
                className="w-full"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Pros</label>
              {pros.map((pro, index) => (
                <div key={`pro-${index}`} className="flex gap-2 mb-2">
                  <Input value={pro} onChange={(e) => handleProChange(index, e.target.value)} className="flex-1" />
                  <Button type="button" variant="outline" size="icon" onClick={() => handleRemovePro(index)}>
                    <span className="sr-only">Remove</span>
                    <span aria-hidden="true">×</span>
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={handleAddPro} className="mt-1">
                Add Pro
              </Button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Cons</label>
              {cons.map((con, index) => (
                <div key={`con-${index}`} className="flex gap-2 mb-2">
                  <Input value={con} onChange={(e) => handleConChange(index, e.target.value)} className="flex-1" />
                  <Button type="button" variant="outline" size="icon" onClick={() => handleRemoveCon(index)}>
                    <span className="sr-only">Remove</span>
                    <span aria-hidden="true">×</span>
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={handleAddCon} className="mt-1">
                Add Con
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>

            <div className="mb-6">
              <label htmlFor="status" className="block text-sm font-medium mb-2">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as "pending" | "approved" | "rejected")}
                className="w-full border rounded-md p-2"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={handleSave} className="w-full bg-teal-600 hover:bg-teal-700 text-white hover:text-white" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={handleDelete} className="w-full text-black hover:bg-teal-50">
                Delete Review
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
