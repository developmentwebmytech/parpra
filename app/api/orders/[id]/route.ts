import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Order } from "@/lib/models/order"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

// Get order details
export async function GET(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { id } = await params
    const orderId = id

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    // Find order
    const order: any = await Order.findOne({ _id: orderId, user_id: userId }).lean()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...order,
      _id: order._id.toString(),
      user_id: order.user_id.toString(),
      items: order.items.map((item: any) => ({
        ...item,
        _id: item._id.toString(),
        product_id: item.product_id.toString(),
        variation_id: item.variation_id.toString(),
      })),
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

// Cancel order
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { id } = await params
    const orderId = id

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    // Find order
    const order = await Order.findOne({ _id: orderId, user_id: userId })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if order can be cancelled
    if (order.status !== "pending" && order.status !== "processing") {
      return NextResponse.json({ error: "Order cannot be cancelled" }, { status: 400 })
    }

    // Update order status
    order.status = "cancelled"
    await order.save()

    return NextResponse.json({ message: "Order cancelled successfully" })
  } catch (error) {
    console.error("Error cancelling order:", error)
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
  }
}
