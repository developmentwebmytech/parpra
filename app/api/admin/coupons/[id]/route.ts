import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Coupon from "@/lib/models/coupon"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

// Get a single coupon by ID (admin)
export async function GET(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()

    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid coupon ID" }, { status: 400 })
    }

    // Find coupon
    const coupon = await Coupon.findById(id).lean()

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Error fetching coupon:", error)
    return NextResponse.json({ error: "Failed to fetch coupon" }, { status: 500 })
  }
}

// Update a coupon (admin)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()

    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid coupon ID" }, { status: 400 })
    }

    // Validate required fields
    if (!data.code || !data.description || !data.discount_type || !data.discount_value || !data.expiry_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if coupon code already exists (excluding current coupon)
    const existingCoupon = await Coupon.findOne({
      code: data.code.toUpperCase(),
      _id: { $ne: id },
    })

    if (existingCoupon) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 })
    }

    // Update coupon
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      {
        ...data,
        code: data.code.toUpperCase(),
        expiry_date: new Date(data.expiry_date),
        start_date: data.start_date ? new Date(data.start_date) : new Date(),
      },
      { new: true },
    )

    if (!updatedCoupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Coupon updated successfully", coupon: updatedCoupon })
  } catch (error) {
    console.error("Error updating coupon:", error)
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 })
  }
}

// Delete a coupon (admin)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()

    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid coupon ID" }, { status: 400 })
    }

    // Delete coupon
    const deletedCoupon = await Coupon.findByIdAndDelete(id)

    if (!deletedCoupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Coupon deleted successfully" })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 })
  }
}
