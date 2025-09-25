import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import {  Product } from "@/lib/models"
import Coupon from "@/lib/models/coupon"
import Cart from "@/lib/models/cart"
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

    const userId = session.user.id
    const { code, cartTotal } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 })
    }

    // Find coupon
    const coupon: any = await Coupon.findOne({
      code: code.toUpperCase(),
      is_active: true,
    }).lean()

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 })
    }

    // Check if coupon is expired
    const now = new Date()
    if (now < new Date(coupon.start_date) || now > new Date(coupon.expiry_date)) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 })
    }

    // Check usage limit
    if (coupon.usage_limit > 0 && coupon.usage_count >= coupon.usage_limit) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 })
    }

    // Check minimum purchase requirement
    if (cartTotal < coupon.minimum_purchase) {
      return NextResponse.json(
        {
          error: `Minimum purchase of ₹${coupon.minimum_purchase.toLocaleString("en-IN")} required`,
          minimumPurchase: coupon.minimum_purchase,
        },
        { status: 400 },
      )
    }

    // Get user's cart to check for product/category restrictions
    if (coupon.applies_to !== "all") {
      const cart: any = await Cart.findOne({ user_id: userId }).lean()

      if (!cart || !cart.items || cart.items.length === 0) {
        return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
      }

      // If coupon applies to specific categories or products
      if (coupon.applies_to === "categories" && coupon.applicable_categories?.length) {
        // Get all products in cart
        const productIds = cart.items.map((item: any) => item.product_id)
        const products = await Product.find({ _id: { $in: productIds } }).lean()

        // Check if any product belongs to applicable categories
        const hasApplicableCategory = products.some((product) =>
          coupon.applicable_categories?.includes(product.category_id),
        )

        if (!hasApplicableCategory) {
          return NextResponse.json(
            {
              error: "Coupon is not applicable to items in your cart",
            },
            { status: 400 },
          )
        }
      }

      if (coupon.applies_to === "products" && coupon.applicable_products?.length) {
        // Check if any cart item is in the applicable products list
        const hasApplicableProduct = cart.items.some((item: any) => coupon.applicable_products?.includes(item.product_id))

        if (!hasApplicableProduct) {
          return NextResponse.json(
            {
              error: "Coupon is not applicable to items in your cart",
            },
            { status: 400 },
          )
        }
      }
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.discount_type === "percentage") {
      discountAmount = (cartTotal * coupon.discount_value) / 100
    } else {
      discountAmount = coupon.discount_value
    }

    // Ensure discount doesn't exceed cart total
    discountAmount = Math.min(discountAmount, cartTotal)

    return NextResponse.json({
      valid: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        description: coupon.description,
      },
      discountAmount,
      finalTotal: cartTotal - discountAmount,
    })
  } catch (error) {
    console.error("Error validating coupon:", error)
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 })
  }
}
