import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"
import { Order } from "@/lib/models/index"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {id} = await params
    const orderId = id
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    const userId = session.user.id
    const order = await Order.findOne({ _id: orderId, user_id: userId })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if order can be cancelled
    if (!["pending", "processing"].includes(order.status)) {
      return NextResponse.json({ error: "This order cannot be cancelled" }, { status: 400 })
    }

    const { reason, additionalComments } = await request.json()

    if (!reason) {
      return NextResponse.json({ error: "Cancellation reason is required" }, { status: 400 })
    }

    // Update order status
    order.status = "cancelled"
    order.cancel_reason = reason
    if (additionalComments) {
      order.additionalComments = additionalComments
    }

    // If payment status is pending, update it to failed
    if (order.payment_status === "pending") {
      order.payment_status = "failed"
    } else if (order.payment_status === "paid" || order.payment_status === "completed") {
      // Mark for refund if already paid
      order.payment_status = "refunded"
    }

    await order.save()

    // Return cleaned order object
    const updatedOrder = order.toObject()
    return NextResponse.json({
      ...updatedOrder,
      _id: updatedOrder._id.toString(),
      user_id: updatedOrder.user_id.toString(),
      items: updatedOrder.items.map((item: any) => ({
        ...item,
        _id: item._id.toString(),
        product_id: item.product_id.toString(),
        variation_id: item.variation_id.toString(),
      })),
    })
  } catch (error) {
    console.error("Error cancelling order:", error)
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
  }
}
