import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Coupon from "@/lib/models/coupon"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Get all coupons (admin)
export async function GET(request: Request) {
  try {
    await connectToDatabase()

    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit
    const search = searchParams.get("search") || ""

    // Build query
    let query: any = {}
    if (search) {
      query = {
        $or: [{ code: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }],
      }
    }

    // Get coupons with pagination
    const coupons = await Coupon.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).lean()

    const totalCoupons = await Coupon.countDocuments(query)
    const totalPages = Math.ceil(totalCoupons / limit)

    return NextResponse.json({
      coupons,
      pagination: {
        totalCoupons,
        totalPages,
        currentPage: page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
  }
}

// Create a new coupon (admin)
export async function POST(request: Request) {
  try {
    await connectToDatabase()

    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.code || !data.description || !data.discount_type || !data.discount_value || !data.expiry_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: data.code.toUpperCase() })
    if (existingCoupon) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 })
    }

    // Create new coupon
    const coupon = new Coupon({
      ...data,
      code: data.code.toUpperCase(),
      expiry_date: new Date(data.expiry_date),
      start_date: data.start_date ? new Date(data.start_date) : new Date(),
    })

    await coupon.save()

    return NextResponse.json({ message: "Coupon created successfully", coupon }, { status: 201 })
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
}
