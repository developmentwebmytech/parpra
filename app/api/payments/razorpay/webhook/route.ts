import { type NextRequest, NextResponse } from "next/server"
import Payment from "@/lib/models/payment"
import { Order } from "@/lib/models/order"
import { connectToDatabase } from "@/lib/mongodb"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.text()
    const signature = request.headers.get("x-razorpay-signature")

    

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (webhookSecret) {
      const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex")

      if (expectedSignature !== signature) {
        console.error("Invalid webhook signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
      }
    }

    const event = JSON.parse(body)
    

    // Handle different webhook events
    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event.payload.payment.entity)
        break
      case "payment.failed":
        await handlePaymentFailed(event.payload.payment.entity)
        break
      case "order.paid":
        await handleOrderPaid(event.payload.order.entity)
        break
      default:
       
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Razorpay webhook error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}

async function handlePaymentCaptured(payment: any) {
  try {
   

    // Find payment record
    const paymentRecord = await Payment.findOne({
      $or: [{ razorpayPaymentId: payment.id }, { razorpayOrderId: payment.order_id }],
    })

    if (paymentRecord) {
      // Update payment status
      await Payment.findByIdAndUpdate(paymentRecord._id, {
        status: "completed",
        razorpayPaymentId: payment.id,
        razorpayResponse: payment,
        completedAt: new Date(),
        updatedAt: new Date(),
      })

      // Update order status
      await Order.findByIdAndUpdate(paymentRecord.orderId, {
        payment_status: "paid",
        status: "confirmed",
        updatedAt: new Date(),
      })

      
    }
  } catch (error) {
    console.error("Error handling payment captured:", error)
  }
}

async function handlePaymentFailed(payment: any) {
  try {
   

    // Find payment record
    const paymentRecord = await Payment.findOne({
      $or: [{ razorpayPaymentId: payment.id }, { razorpayOrderId: payment.order_id }],
    })

    if (paymentRecord) {
      // Update payment status
      await Payment.findByIdAndUpdate(paymentRecord._id, {
        status: "failed",
        razorpayPaymentId: payment.id,
        razorpayResponse: payment,
        updatedAt: new Date(),
      })

      
    }
  } catch (error) {
    console.error("Error handling payment failed:", error)
  }
}

async function handleOrderPaid(order: any) {
  try {
    

    // Find payment record
    const paymentRecord = await Payment.findOne({ razorpayOrderId: order.id })

    if (paymentRecord) {
      // Update order status
      await Order.findByIdAndUpdate(paymentRecord.orderId, {
        payment_status: "paid",
        status: "confirmed",
        updatedAt: new Date(),
      })

      
    }
  } catch (error) {
    console.error("Error handling order paid:", error)
  }
}
