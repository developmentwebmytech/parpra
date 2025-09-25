import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Review from "@/lib/models/review"
import {Product} from "@/lib/models"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status") || "all"
    const productId = searchParams.get("productId") || null
    const rating = searchParams.get("rating") ? Number.parseInt(searchParams.get("rating") || "0") : null
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit

    await connectToDatabase()

    // Build query
    const query: any = {}

    if (status !== "all") {
      query.status = status
    }

    if (productId) {
      query.product_id = productId
    }

    if (rating) {
      query.rating = rating
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { comment: { $regex: search, $options: "i" } },
        { user_name: { $regex: search, $options: "i" } },
      ]
    }

    // Get reviews
    const reviews = await Review.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).lean()

    // Get product details for each review
    const reviewsWithProducts = await Promise.all(
      reviews.map(async (review) => {
        const product = await Product.findById(review.product_id).select("name slug").lean()
        return {
          ...review,
          product: product || { name: "Unknown Product", slug: "" },
        }
      }),
    )

    // Get total count for pagination
    const totalReviews = await Review.countDocuments(query)

    return NextResponse.json({
      reviews: reviewsWithProducts,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error("Error fetching admin reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { reviewIds, action } = await request.json()

    if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      return NextResponse.json({ error: "Review IDs are required" }, { status: 400 })
    }

    if (!action || !["approve", "reject", "delete"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    await connectToDatabase()

    if (action === "delete") {
      await Review.deleteMany({ _id: { $in: reviewIds } })
      return NextResponse.json({
        message: `${reviewIds.length} reviews deleted successfully`,
      })
    } else {
      const status = action === "approve" ? "approved" : "rejected"
      await Review.updateMany({ _id: { $in: reviewIds } }, { $set: { status } })
      return NextResponse.json({
        message: `${reviewIds.length} reviews ${action}d successfully`,
      })
    }
  } catch (error) {
    console.error("Error updating reviews:", error)
    return NextResponse.json({ error: "Failed to update reviews" }, { status: 500 })
  }
}
