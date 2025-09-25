import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import {Product} from "@/lib/models"
import Review from "@/lib/models/review"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }): Promise<NextResponse> {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const sort = searchParams.get("sort") || "newest"

    const skip = (page - 1) * limit

    await connectToDatabase()

    // Find the product by slug
    const product = await Product.findOne({ slug })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Define sort options
    let sortOptions = {}
    switch (sort) {
      case "highest":
        sortOptions = { rating: -1, created_at: -1 }
        break
      case "lowest":
        sortOptions = { rating: 1, created_at: -1 }
        break
      case "helpful":
        sortOptions = { helpful_votes: -1, created_at: -1 }
        break
      case "newest":
      default:
        sortOptions = { created_at: -1 }
    }

    // Get approved reviews for this product
    const reviews = await Review.find({
      product_id: product._id,
      status: "approved",
    })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const totalReviews = await Review.countDocuments({
      product_id: product._id,
      status: "approved",
    })

    // Calculate average rating
    const ratingStats = await Review.aggregate([
      { $match: { product_id: product._id, status: "approved" } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ])

    // Format rating stats
    const ratingCounts = Array.from({ length: 5 }, (_, i) => {
      const stars = 5 - i
      const stat = ratingStats.find((s) => s._id === stars)
      return {
        rating: stars,
        count: stat ? stat.count : 0,
      }
    })

    const totalRatings = ratingCounts.reduce((sum, item) => sum + item.count, 0)
    const averageRating =
      totalRatings > 0 ? ratingCounts.reduce((sum, item) => sum + item.rating * item.count, 0) / totalRatings : 0

    // Check if the current user has already reviewed this product
    let hasReviewed = false
    const session = await getServerSession(authOptions)

    if (session?.user) {
      const userReview = await Review.findOne({
        product_id: product._id,
        user_id: session.user.id,
      }).lean()

      hasReviewed = !!userReview
    }

    return NextResponse.json({
      reviews,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page,
      averageRating: Number.parseFloat(averageRating.toFixed(1)),
      ratingCounts,
      hasReviewed,
    })
  } catch (error) {
    console.error("Error fetching product reviews:", error)
    return NextResponse.json({ error: "Failed to fetch product reviews" }, { status: 500 })
  }
}
