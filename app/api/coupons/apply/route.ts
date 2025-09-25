import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Coupon from "@/lib/models/coupon"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    await connectToDatabase()

    // Check user authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 })
    }

    // Find and update coupon usage count
    const coupon = await Coupon.findOneAndUpdate(
      { code: code.toUpperCase(), is_active: true },
      { $inc: { usage_count: 1 } },
      { new: true },
    )

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Coupon applied successfully",
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
    })
  } catch (error) {
    console.error("Error applying coupon:", error)
    return NextResponse.json({ error: "Failed to apply coupon" }, { status: 500 })
  }
}
