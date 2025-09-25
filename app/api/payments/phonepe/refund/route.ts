import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PhonePeService } from "@/lib/services/phonepe"
import Payment from "@/lib/models/payment"
import {Order} from "@/lib/models/order"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    // Check authentication (admin only)
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const body = await request.json()
    const { merchantTransactionId, refundAmount, reason } = body

    if (!merchantTransactionId || !refundAmount) {
      return NextResponse.json({ error: "Transaction ID and refund amount are required" }, { status: 400 })
    }

    
    

    // Find the original payment
    const originalPayment = await Payment.findOne({ merchantTransactionId })
    if (!originalPayment) {
      return NextResponse.json({ error: "Original payment not found" }, { status: 404 })
    }

    if (originalPayment.status !== "completed") {
      return NextResponse.json({ error: "Cannot refund incomplete payment" }, { status: 400 })
    }

    if (refundAmount > originalPayment.amount) {
      return NextResponse.json({ error: "Refund amount cannot exceed original payment" }, { status: 400 })
    }

    // Generate refund transaction ID
    const refundTransactionId = `REFUND_${merchantTransactionId}_${Date.now()}`

    // Initialize PhonePe service
    const phonePeService = new PhonePeService()

    // Process refund
    const response = await phonePeService.refundPayment(
      refundTransactionId,
      originalPayment.transactionId || merchantTransactionId,
      refundAmount,
    )

    
    

    if (response.success) {
      // Create refund payment record
      const refundPayment = new Payment({
        orderId: originalPayment.orderId,
        userId: originalPayment.userId,
        merchantTransactionId: refundTransactionId,
        amount: -refundAmount, // Negative amount for refund
        currency: "INR",
        paymentMethod: "phonepe_refund",
        status: "completed",
        transactionId: response.data?.transactionId,
        phonepeResponse: response,
        createdAt: new Date(),
      })

      await refundPayment.save()

      // Update order status if full refund
      if (refundAmount === originalPayment.amount && originalPayment.orderId) {
        await Order.findByIdAndUpdate(originalPayment.orderId, {
          status: "refunded",
          payment_status: "refunded",
          updatedAt: new Date(),
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          refundTransactionId,
          originalTransactionId: merchantTransactionId,
          refundAmount,
          status: "completed",
          ...response.data,
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: response.message || "Refund processing failed",
          code: response.code,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("PhonePe refund error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
