import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Order } from "@/lib/models/index"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: orderId } = await params
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    const userId = session.user.id
    const order = await Order.findOne({ _id: orderId, user_id: userId })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if order can be returned (must be delivered)
    if (order.status !== "delivered") {
      return NextResponse.json({ error: "Only delivered orders can be returned" }, { status: 400 })
    }

    // Check if already cancelled or returned
    if (["cancelled", "returned", "return_requested"].includes(order.status)) {
      return NextResponse.json({ error: "This order cannot be returned" }, { status: 400 })
    }

    const { reason, additionalComments, returnType, items } = await request.json()

    if (!reason) {
      return NextResponse.json({ error: "Return reason is required" }, { status: 400 })
    }

    // For partial returns, items must be specified
    if (returnType === "partial" && (!items || !items.length)) {
      return NextResponse.json({ error: "Please select at least one item to return" }, { status: 400 })
    }

    // Update order status
    order.status = "return_requested"
    order.return_reason = reason
    if (additionalComments) {
      order.additionalComments = additionalComments
    }

    // Store which items are being returned (for partial returns)
    if (returnType === "partial" && items !== "all") {
      order.return_items = items
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
    console.error("Error processing return request:", error)
    return NextResponse.json({ error: "Failed to process return request" }, { status: 500 })
  }
}
