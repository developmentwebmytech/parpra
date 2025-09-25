"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Star, Check, X, Edit, Trash2, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface Review {
  _id: string
  user_name: string
  rating: number
  title: string
  comment: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  product: {
    name: string
    slug: string
  }
}

export default function AdminReviewsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedReviews, setSelectedReviews] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [rating, setRating] = useState<number | null>(null)
  const [isFiltering, setIsFiltering] = useState(false)

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)

        let url = `/api/admin/reviews?page=${page}`
        if (search) url += `&search=${encodeURIComponent(search)}`
        if (status !== "all") url += `&status=${status}`
        if (rating) url += `&rating=${rating}`

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error("Failed to fetch reviews")
        }

        const data = await response.json()
        setReviews(data.reviews)
        setTotalPages(data.totalPages)
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
  }, [page, search, status, rating, toast])

  const handleSelectReview = (reviewId: string) => {
    setSelectedReviews((prev) => (prev.includes(reviewId) ? prev.filter((id) => id !== reviewId) : [...prev, reviewId]))
  }

  const handleSelectAll = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([])
    } else {
      setSelectedReviews(reviews.map((review) => review._id))
    }
  }

  const handleBulkAction = async (action: "approve" | "reject" | "delete") => {
    if (selectedReviews.length === 0) {
      toast({
        title: "No reviews selected",
        description: "Please select at least one review",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewIds: selectedReviews,
          action,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} reviews`)
      }

      toast({
        title: "Success",
        description: `${selectedReviews.length} reviews ${action}d successfully`,
      })

      // Refresh the reviews list
      setSelectedReviews([])
      router.refresh()

      // Update the local state to reflect the changes
      if (action === "delete") {
        setReviews(reviews.filter((review) => !selectedReviews.includes(review._id)))
      } else {
        setReviews(
          reviews.map((review) =>
            selectedReviews.includes(review._id)
              ? { ...review, status: action === "approve" ? "approved" : "rejected" }
              : review,
          ),
        )
      }
    } catch (error) {
      console.error(`Error ${action}ing reviews:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action} reviews`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete review")
      }

      toast({
        title: "Success",
        description: "Review deleted successfully",
      })

      // Remove the deleted review from the list
      setReviews(reviews.filter((review) => review._id !== reviewId))
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      })
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to first page when searching
  }

  const handleFilterToggle = () => {
    setIsFiltering(!isFiltering)
  }

  const handleFilterReset = () => {
    setSearch("")
    setStatus("all")
    setRating(null)
    setPage(1)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Approved</span>
      case "rejected":
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Rejected</span>
      case "pending":
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
    }
  }

  return (
    <div className="px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <Button onClick={handleFilterToggle} variant="outline" className="flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters */}
      {isFiltering && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <form onSubmit={handleSearch}>
                <Input
                  type="text"
                  placeholder="Search reviews..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </form>
            </div>
            <div>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPage(1)
                }}
                className="w-full border rounded-md p-2"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <select
                value={rating || ""}
                onChange={(e) => {
                  setRating(e.target.value ? Number.parseInt(e.target.value) : null)
                  setPage(1)
                }}
                className="w-full border rounded-md p-2"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleFilterReset} size="sm">
              Reset Filters
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedReviews.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm">
              {selectedReviews.length} {selectedReviews.length === 1 ? "review" : "reviews"} selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("approve")}
                className="text-green-600 hover:bg-green-50"
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("reject")}
                className="text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("delete")}
                className="text-gray-600 hover:bg-gray-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No reviews found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedReviews.length === reviews.length && reviews.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Rating</th>
                <th className="p-3 text-left">Review</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedReviews.includes(review._id)}
                      onChange={() => handleSelectReview(review._id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-3">
                    <Link href={`/products/${review.product.slug}`} className="text-amber-700 hover:underline">
                      {review.product.name}
                    </Link>
                  </td>
                  <td className="p-3">{renderStars(review.rating)}</td>
                  <td className="p-3">
                    <div className="font-medium">{review.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{review.comment}</div>
                  </td>
                  <td className="p-3">{review.user_name}</td>
                  <td className="p-3 whitespace-nowrap">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </td>
                  <td className="p-3">{getStatusBadge(review.status)}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Link href={`/dashboard/reviews/${review._id}`}>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-amber-700">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReview(review._id)}
                        className="bg-gray-500 hover:bg-red-600 hover:text-white text-white transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1} className="mr-2">
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
