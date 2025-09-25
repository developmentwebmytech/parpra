import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { RazorpayService } from "@/lib/services/razorpay"
import Payment from "@/lib/models/payment"
import { Order } from "@/lib/models/order"
import { connectToDatabase } from "@/lib/mongodb"
import { emailService } from "@/lib/services/email"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required payment parameters" }, { status: 400 })
    }

    // Initialize Razorpay service
    const razorpayService = new RazorpayService()

    // Verify payment signature
    const verificationResult = await razorpayService.verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    )

    if (!verificationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: verificationResult.error || "Payment verification failed",
        },
        { status: 400 },
      )
    }

    if (!verificationResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment signature",
        },
        { status: 400 },
      )
    }

    // Find payment record
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id })
    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 })
    }

    // Check if user owns this payment
    if (payment.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized access to payment" }, { status: 403 })
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await razorpayService.fetchPayment(razorpay_payment_id)

    // Update payment record
    await Payment.findByIdAndUpdate(payment._id, {
      status: "completed",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      razorpayResponse: paymentDetails.data,
      completedAt: new Date(),
      updatedAt: new Date(),
    })

    // Update order status
    const order = await Order.findByIdAndUpdate(
      payment.orderId,
      {
        payment_status: "paid",
        status: "confirmed",
        updatedAt: new Date(),
      },
      { new: true },
    )

    

    // Send order confirmation email
    if (order && session.user.email) {
      try {
        await emailService.sendOrderConfirmation(session.user.email, {
          orderNumber: order.order_number,
          createdAt: order.createdAt,
          total: order.total,
          paymentMethod: "razorpay",
          items: order.items,
          shippingAddress: order.shipping_address,
          _id: order._id,
        })
        console.log("Order confirmation email sent")
      } catch (emailError) {
        console.error("Error sending order confirmation email:", emailError)
        // Don't fail the payment if email fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentId: razorpay_payment_id,
        orderId: payment.orderId,
        status: "completed",
      },
    })
  } catch (error) {
    console.error("Razorpay payment verification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
