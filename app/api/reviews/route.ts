import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import {Product, User} from "@/lib/models"
import Review from "@/lib/models/review"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "You must be logged in to submit a review" }, { status: 401 })
    }

    const { product_id, rating, title, comment, pros, cons } = await request.json()

    if (!product_id || !rating || !title || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    await connectToDatabase()

    // Verify the product exists
    const product = await Product.findById(product_id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get user information
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      product_id,
      user_id: user._id,
    })

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 })
    }

    // Create the review
    const review = new Review({
      product_id,
      user_id: user._id,
      user_name: user.name,
      rating,
      title,
      comment,
      pros: pros || [],
      cons: cons || [],
      status: "pending", // All reviews start as pending and need approval
    })

    await review.save()

    return NextResponse.json(
      {
        message: "Review submitted successfully and is pending approval",
        review: {
          ...review.toObject(),
          _id: review._id.toString(),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error submitting review:", error)
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "You must be logged in to update a review" }, { status: 401 })
    }

    const { review_id, helpful } = await request.json()

    if (!review_id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 })
    }

    await connectToDatabase()

    // Find the review
    const review = await Review.findById(review_id)
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Update helpful votes
    if (helpful === true) {
      review.helpful_votes += 1
      await review.save()
    }

    return NextResponse.json({
      message: "Review updated successfully",
      helpful_votes: review.helpful_votes,
    })
  } catch (error) {
    console.error("Error updating review:", error)
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
  }
}
