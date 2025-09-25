import { type NextRequest, NextResponse } from "next/server"
import { PhonePeService } from "@/lib/services/phonepe"
import Payment from "@/lib/models/payment"
import {Order} from "@/lib/models/order"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    

    const { response, checksum } = body

    if (!response || !checksum) {
      console.error("Missing response or checksum in callback")
      return NextResponse.json({ error: "Invalid callback data" }, { status: 400 })
    }

    // Initialize PhonePe service
    const phonePeService = new PhonePeService()

    // Verify callback using PhonePe SDK
    const isValid = phonePeService.verifyCallback(response, checksum)
    if (!isValid) {
      console.error("PhonePe callback verification failed")
      return NextResponse.json({ error: "Invalid callback signature" }, { status: 400 })
    }

    // Decode response
    const decodedResponse = JSON.parse(Buffer.from(response, "base64").toString())
    

    const { merchantTransactionId, transactionId, amount, state, responseCode } = decodedResponse

    // Find payment record
    const payment = await Payment.findOne({ merchantTransactionId })
    if (!payment) {
      console.error("Payment record not found:", merchantTransactionId)
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 })
    }

    // Update payment status based on PhonePe response
    let paymentStatus = "failed"
    let orderStatus = "pending"

    if (state === "COMPLETED" && responseCode === "SUCCESS") {
      paymentStatus = "completed"
      orderStatus = "confirmed"
    } else if (state === "FAILED") {
      paymentStatus = "failed"
      orderStatus = "cancelled"
    } else if (state === "PENDING") {
      paymentStatus = "pending"
      orderStatus = "pending"
    }

    // Update payment record
    await Payment.findByIdAndUpdate(payment._id, {
      status: paymentStatus,
      transactionId,
      phonepeResponse: decodedResponse,
      completedAt: paymentStatus === "completed" ? new Date() : null,
      updatedAt: new Date(),
    })

    // Update order status
    if (payment.orderId) {
      await Order.findByIdAndUpdate(payment.orderId, {
        payment_status: paymentStatus === "completed" ? "paid" : "pending",
        status: orderStatus,
        updatedAt: new Date(),
      })
    }

  

    return NextResponse.json({ success: true, status: paymentStatus })
  } catch (error) {
    console.error("PhonePe callback processing error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "PhonePe callback endpoint is active" })
}
