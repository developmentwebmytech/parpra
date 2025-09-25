import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import{ Order }from "@/lib/models/order"
import {User} from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const sortField = searchParams.get("sortField") || "createdAt"
    const sortDirection = searchParams.get("sortDirection") || "desc"

    const skip = (page - 1) * limit

    // Build query
    const query: any = {}

    if (status && status !== "all") {
      query.status = status
    }

    if (search) {
      const searchRegex = new RegExp(search, "i")

      // Find users that match the search term
      const users = await User.find({
        $or: [{ email: searchRegex }, { first_name: searchRegex }, { last_name: searchRegex }],
      }).select("_id")

      const userIds = users.map((user) => user._id)

      query.$or = [
        { order_number: searchRegex },
        { "shipping_address.full_name": searchRegex },
        { user_id: { $in: userIds } },
      ]
    }

    // Count total orders for pagination
    const total = await Order.countDocuments(query)

    // Get orders with pagination and sorting
    const orders = await Order.find(query)
      .sort({ [sortField]: sortDirection === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
  }
}
