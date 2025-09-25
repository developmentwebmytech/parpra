import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Order } from "@/lib/models/order"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }>}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 })
    }

    await connectToDatabase()

    const order = await Order.findById(id).lean()

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error(`Error fetching order:`, error)
    return NextResponse.json({ success: false, error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }>}) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized - Admin access required" }, { status: 403 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const { status, tracking_number, notes } = body

    await connectToDatabase()

    const order = await Order.findById(id)

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    // Update fields if provided
    if (status) {
      order.status = status

      // Update payment status based on order status
      if (status === "cancelled") {
        order.payment_status = "refunded"
      } else if (status === "delivered") {
        order.payment_status = "completed"
      }
    }

    if (tracking_number !== undefined) {
      order.tracking_number = tracking_number
    }

    if (notes !== undefined) {
      order.notes = notes
    }

    // Add status history entry
    if (status && status !== order.status) {
      if (!order.status_history) {
        order.status_history = []
      }

      order.status_history.push({
        status,
        timestamp: new Date(),
        user_id: session.user.id,
        user_email: session.user.email,
      })
    }

    await order.save()

    return NextResponse.json({
      success: true,
      order: order.toObject(),
      message: "Order updated successfully",
    })
  } catch (error) {
    console.error(`Error updating order:`, error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update order",
      },
      { status: 500 },
    )
  }
}
