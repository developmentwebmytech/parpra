"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Star, ThumbsUp, Check, X } from "lucide-react"
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
  created_at: string
  status: "pending" | "approved" | "rejected"
}

interface RatingCount {
  rating: number
  count: number
}

interface ProductReviewsProps {
  productId: string
  productSlug: string
}

export default function ProductReviews({ productId, productSlug }: ProductReviewsProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [reviews, setReviews] = useState<Review[]>([])
  const [totalReviews, setTotalReviews] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [ratingCounts, setRatingCounts] = useState<RatingCount[]>([])
  const [hasReviewed, setHasReviewed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState("newest")
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [pros, setPros] = useState<string[]>([""])
  const [cons, setCons] = useState<string[]>([""])
  const [submitting, setSubmitting] = useState(false)

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${productSlug}/reviews?page=${page}&sort=${sort}`)

        if (!response.ok) {
          throw new Error("Failed to fetch reviews")
        }

        const data = await response.json()
        setReviews(data.reviews)
        setTotalReviews(data.totalReviews)
        setAverageRating(data.averageRating)
        setRatingCounts(data.ratingCounts)
        setHasReviewed(data.hasReviewed)
      } catch (error) {
        console.error("Error fetching reviews:", error)
        toast({
          title: "Error",
          description: "Failed to load reviews",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [productSlug, page, sort, toast])

  const handleSortChange = (newSort: string) => {
    setSort(newSort)
    setPage(1)
  }

  const handleRatingClick = (value: number) => {
    setRating(value)
  }

  const handleAddPro = () => {
    setPros([...pros, ""])
  }

  const handleAddCon = () => {
    setCons([...cons, ""])
  }

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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (status !== "authenticated") {
      router.push(`/login?redirect=/products/${productSlug}`)
      return
    }

    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      })
      return
    }

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a review title",
        variant: "destructive",
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a review comment",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      // Filter out empty pros and cons
      const filteredPros = pros.filter((p) => p.trim() !== "")
      const filteredCons = cons.filter((c) => c.trim() !== "")

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          rating,
          title,
          comment,
          pros: filteredPros,
          cons: filteredCons,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to submit review")
      }

      toast({
        title: "Success",
        description: "Your review has been submitted and is pending approval",
      })

      // Reset form
      setRating(0)
      setTitle("")
      setComment("")
      setPros([""])
      setCons([""])
      setShowForm(false)
      setHasReviewed(true)
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleHelpfulClick = async (reviewId: string) => {
    if (status !== "authenticated") {
      toast({
        title: "Sign in required",
        description: "Please sign in to mark reviews as helpful",
      })
      return
    }

    try {
      const response = await fetch("/api/reviews", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          review_id: reviewId,
          helpful: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to mark review as helpful")
      }

      const data = await response.json()

      // Update the helpful votes count in the UI
      setReviews(
        reviews.map((review) => (review._id === reviewId ? { ...review, helpful_votes: data.helpful_votes } : review)),
      )
    } catch (error) {
      console.error("Error marking review as helpful:", error)
      toast({
        title: "Error",
        description: "Failed to mark review as helpful",
        variant: "destructive",
      })
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? "text-amber-500 fill-amber-500"
                : star - 0.5 <= rating
                  ? "text-amber-500 fill-amber-500" // For half stars (not implemented here)
                  : "text-gray-300"
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="mt-16 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      {/* Rating Summary */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold text-amber-700">{averageRating.toFixed(1)}</div>
          <div className="flex mt-2 mb-1">{renderStars(averageRating)}</div>
          <div className="text-sm text-gray-500">{totalReviews} reviews</div>
        </div>

        <div className="flex-1">
          {ratingCounts.map((item) => (
            <div key={item.rating} className="flex items-center mb-2">
              <div className="w-24 flex items-center">
                <span className="mr-1">{item.rating}</span>
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              </div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: totalReviews > 0 ? `${(item.count / totalReviews) * 100}%` : "0%",
                  }}
                ></div>
              </div>
              <div className="w-12 text-right text-sm text-gray-500">{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Button */}
      {!hasReviewed && (
        <div className="mb-8">
          <Button
            onClick={() => {
              if (status !== "authenticated") {
                router.push(`/login?redirect=/products/${productSlug}`)
              } else {
                setShowForm(!showForm)
              }
            }}
            className="bg-amber-700 hover:bg-amber-800"
          >
            Write a Review
          </Button>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="mb-8 p-6 border rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-4">Write Your Review</h3>

          <form onSubmit={handleSubmitReview}>
            {/* Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button key={value} type="button" onClick={() => handleRatingClick(value)} className="p-1">
                    <Star
                      className={`h-8 w-8 ${value <= rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label htmlFor="review-title" className="block text-sm font-medium mb-2">
                Review Title
              </label>
              <Input
                id="review-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                maxLength={100}
                required
              />
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label htmlFor="review-comment" className="block text-sm font-medium mb-2">
                Review
              </label>
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product"
                rows={4}
                required
              />
            </div>

            {/* Pros */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Pros (Optional)</label>
              {pros.map((pro, index) => (
                <div key={`pro-${index}`} className="flex gap-2 mb-2">
                  <Input
                    value={pro}
                    onChange={(e) => handleProChange(index, e.target.value)}
                    placeholder="What did you like?"
                    className="flex-1"
                  />
                  {pros.length > 1 && (
                    <Button type="button" variant="outline" size="icon" onClick={() => handleRemovePro(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={handleAddPro} className="mt-1">
                Add Pro
              </Button>
            </div>

            {/* Cons */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Cons (Optional)</label>
              {cons.map((con, index) => (
                <div key={`con-${index}`} className="flex gap-2 mb-2">
                  <Input
                    value={con}
                    onChange={(e) => handleConChange(index, e.target.value)}
                    placeholder="What could be improved?"
                    className="flex-1"
                  />
                  {cons.length > 1 && (
                    <Button type="button" variant="outline" size="icon" onClick={() => handleRemoveCon(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={handleAddCon} className="mt-1">
                Add Con
              </Button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-700 hover:bg-amber-800" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Sort Controls */}
      {totalReviews > 0 && (
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-500">
            Showing {reviews.length} of {totalReviews} reviews
          </div>
          <div className="flex items-center">
            <span className="text-sm mr-2">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="border rounded p-1 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
        </div>
      ) : totalReviews === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-1">
                    {renderStars(review.rating)}
                    <span className="ml-2 font-semibold">{review.title}</span>
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    By {review.user_name} • {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleHelpfulClick(review._id)}
                  className="text-gray-500 hover:text-amber-700"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  <span className="text-xs">Helpful ({review.helpful_votes})</span>
                </Button>
              </div>

              <p className="mb-3">{review.comment}</p>

              {(review.pros.length > 0 || review.cons.length > 0) && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {review.pros.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold flex items-center text-green-600 mb-1">
                        <Check className="h-4 w-4 mr-1" /> Pros
                      </h4>
                      <ul className="text-sm space-y-1 pl-6 list-disc">
                        {review.pros.map((pro, index) => (
                          <li key={index}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {review.cons.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold flex items-center text-red-600 mb-1">
                        <X className="h-4 w-4 mr-1" /> Cons
                      </h4>
                      <ul className="text-sm space-y-1 pl-6 list-disc">
                        {review.cons.map((con, index) => (
                          <li key={index}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalReviews > 0 && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1} className="mr-2">
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {Math.ceil(totalReviews / 10)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(totalReviews / 10)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
