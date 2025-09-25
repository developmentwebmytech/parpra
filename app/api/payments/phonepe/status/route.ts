import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PhonePeService } from "@/lib/services/phonepe"
import Payment from "@/lib/models/payment"
import {Order} from "@/lib/models/order"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const merchantTransactionId = searchParams.get("txnId") || searchParams.get("merchantTransactionId")

    if (!merchantTransactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
    }

    
    

    // Find payment record
    const payment = await Payment.findOne({ merchantTransactionId })
    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 })
    }

    // Check if user owns this payment
    if (payment.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized access to payment" }, { status: 403 })
    }

    // Initialize PhonePe service
    const phonePeService = new PhonePeService()

    // Check payment status with PhonePe
    const response = await phonePeService.checkPaymentStatus(merchantTransactionId)

  

    if (response.success && response.data) {
      const { state, responseCode, amount, transactionId } = response.data

      // Update payment status based on PhonePe response
      let paymentStatus = payment.status
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

      // Update payment record if status changed
      if (paymentStatus !== payment.status) {
        await Payment.findByIdAndUpdate(payment._id, {
          status: paymentStatus,
          transactionId,
          phonepeResponse: response.data,
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
      }

      return NextResponse.json({
        success: true,
        data: {
          merchantTransactionId,
          transactionId,
          status: paymentStatus,
          amount: amount / 100, // Convert from paise to rupees
          state,
          responseCode,
          orderId: payment.orderId,
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: response.message || "Failed to check payment status",
          code: response.code,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("PhonePe status check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
