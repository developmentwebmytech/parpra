import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import {  Product, Variation, User } from "@/lib/models"
import Cart from "@/lib/models/cart"
import { Order } from "@/lib/models/order"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { emailService } from "@/lib/services/email"
import mongoose from "mongoose"

// Get user's orders
export async function GET() {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Find orders for the user
    const orders = await Order.find({ user_id: userId }).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

// Create a new order
export async function POST(request: Request) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const data = await request.json()

    

    // Validate required fields
    if (!data.shipping_address || !data.billing_address || !data.payment_method) {
      console.error("Missing required fields:", {
        shipping_address: !!data.shipping_address,
        billing_address: !!data.billing_address,
        payment_method: !!data.payment_method,
      })
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: {
            shipping_address: !data.shipping_address ? "Required" : "Present",
            billing_address: !data.billing_address ? "Required" : "Present",
            payment_method: !data.payment_method ? "Required" : "Present",
          },
        },
        { status: 400 },
      )
    }

    // Validate shipping address structure
    const requiredAddressFields = ["full_name", "address_line1", "city", "state", "postal_code", "country", "phone"]
    for (const field of requiredAddressFields) {
      if (!data.shipping_address[field]) {
        console.error(`Missing shipping address field: ${field}`)
        return NextResponse.json(
          {
            error: `Missing required shipping address field: ${field}`,
          },
          { status: 400 },
        )
      }
    }

    // Get user's cart
    const cart: any = await Cart.findOne({ user_id: userId }).lean()
    if (!cart || !cart.items || cart.items.length === 0) {
      console.error("Cart is empty for user:", userId)
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    

    // Get user details for email
    const user: any = await User.findById(userId).lean()
    if (!user) {
      console.error("User not found:", userId)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prepare order items
    const orderItems = []
    let subtotal = 0

    for (const item of cart.items) {
      try {
        const product: any = await Product.findById(item.product_id).lean()
        const variation: any = await Variation.findById(item.variation_id).lean()

        if (!product || !variation) {
          console.warn(`Product or variation not found for item:`, item)
          continue
        }

        // Check if item is still in stock
        if (variation.quantity < item.quantity) {
          return NextResponse.json(
            {
              error: `Not enough stock for ${product.name} (${variation.color}, ${variation.size})`,
            },
            { status: 400 },
          )
        }

        // Add item to order
        orderItems.push({
          product_id: item.product_id,
          variation_id: item.variation_id,
          quantity: item.quantity,
          price: item.price,
          name: product.name,
          image: variation.image,
          size: variation.size,
          color: variation.color,
        })

        // Update subtotal
        subtotal += item.price * item.quantity

        // Update product variation quantity
        await Variation.findByIdAndUpdate(item.variation_id, {
          $inc: { quantity: -item.quantity },
        })
      } catch (err) {
        console.error("Error processing cart item:", err)
      }
    }

    if (orderItems.length === 0) {
      console.error("No valid items in cart")
      return NextResponse.json({ error: "No valid items in cart" }, { status: 400 })
    }



    // Apply discount if coupon is provided
    let discountAmount = 0
    if (data.coupon_code && data.discount_amount) {
      discountAmount = data.discount_amount
    }

    // Calculate final total
    const total = subtotal - discountAmount

    // Generate order number
    const orderCount = await Order.countDocuments()
    const orderNumber = `ORD${new Date().getFullYear()}${(orderCount + 1).toString().padStart(6, "0")}`

    

    // Create order
    const orderData = {
      user_id: new mongoose.Types.ObjectId(userId),
      order_number: orderNumber,
      items: orderItems,
      total,
      subtotal,
      discount: discountAmount,
      coupon_code: data.coupon_code || null,
      status: "pending",
      shipping_address: data.shipping_address,
      billing_address: data.billing_address,
      payment_method: data.payment_method,
      payment_status:
        data.payment_method === "cod" ? "pending" : data.payment_method === "phonepe" ? "pending" : "processing",
    }

   

    const order = new Order(orderData)
    await order.save()

    

    // Clear the cart after successful order
    await Cart.findOneAndUpdate({ user_id: userId }, { $set: { items: [], total: 0 } })

  

    // Send order confirmation email
    try {
      await emailService.sendOrderConfirmation(user.email , {
        orderNumber: order.order_number,
        createdAt: order.createdAt,
        total: order.total,
        paymentMethod: order.payment_method,
        items: orderItems,
        shippingAddress: order.shipping_address,
        _id: order._id,
      })
      
    } catch (emailError) {
      console.error("Error sending order confirmation email:", emailError)
      // Don't fail the order if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order: {
        _id: order._id,
        order_number: order.order_number,
        total: order.total,
        payment_method: order.payment_method,
      },
    })
  } catch (error: any) {
    console.error("Error creating order:", error)
    console.error("Error stack:", error.stack)
    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
