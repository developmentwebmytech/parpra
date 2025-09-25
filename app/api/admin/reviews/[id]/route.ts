import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Review from "@/lib/models/review"
import {Product} from "@/lib/models"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }>}): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

   const { id } = await params

    await connectToDatabase()

    const review: any = await Review.findById(id).lean()

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Get product details
    const product: any = await Product.findById(review.product_id).select("name slug").lean()

    return NextResponse.json({
      review: {
        ...review,
        product: product || { name: "Unknown Product", slug: "" },
      },
    })
  } catch (error: any) {
    console.error(`Error fetching review :`, error)
    return NextResponse.json({ error: "Failed to fetch review" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }>}): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

   const { id } = await params
    const { status, title, comment, rating, pros, cons } = await request.json()

    await connectToDatabase()

    const review = await Review.findById(id)

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Update fields if provided
    if (status) review.status = status
    if (title) review.title = title
    if (comment) review.comment = comment
    if (rating) review.rating = rating
    if (pros) review.pros = pros
    if (cons) review.cons = cons

    await review.save()

    return NextResponse.json({
      message: "Review updated successfully",
      review: {
        ...review.toObject(),
        _id: review._id.toString(),
      },
    })
  } catch (error) {
    console.error(`Error updating review :`, error)
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }>}): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

   const { id } = await params

    await connectToDatabase()

    const review = await Review.findById(id)

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    await review.deleteOne()

    return NextResponse.json({
      message: "Review deleted successfully",
    })
  } catch (error) {
    console.error(`Error deleting review :`, error)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
