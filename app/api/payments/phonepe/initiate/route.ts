import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PhonePeService } from "@/lib/services/phonepe"
import Payment from "@/lib/models/payment"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const body = await request.json()
    const { orderId, amount, mobileNumber } = body

    

    if (!orderId || !amount) {
      return NextResponse.json({ error: "Order ID and amount are required" }, { status: 400 })
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Generate unique transaction ID
    const merchantTransactionId = `TXN_${orderId}_${Date.now()}`
    const merchantUserId = session.user.id || session.user.email?.split("@")[0] || "user"

    // Create payment record
    const payment = new Payment({
      orderId,
      userId: session.user.id,
      merchantTransactionId,
      amount,
      currency: "INR",
      paymentMethod: "phonepe",
      status: "pending",
      createdAt: new Date(),
    })

    await payment.save()
   

    // Initialize PhonePe service
    const phonePeService = new PhonePeService()

    // Prepare payment request
    const paymentRequest = {
      merchantTransactionId,
      merchantUserId,
      amount,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?txnId=${merchantTransactionId}`,
      redirectMode: "POST",
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/phonepe/callback`,
      mobileNumber,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    }

   
    

    // Initiate payment with PhonePe
    const response = await phonePeService.initiatePayment(paymentRequest)

    
    

    if (response.success) {
      // Update payment record with PhonePe response
      await Payment.findByIdAndUpdate(payment._id, {
        transactionId: response.data?.transactionId,
        phonepeResponse: response,
        updatedAt: new Date(),
      })

      return NextResponse.json({
        success: true,
        data: {
          merchantTransactionId,
          paymentUrl: response.data?.instrumentResponse?.redirectInfo?.url,
          ...response.data,
        },
      })
    } else {
      // Update payment status to failed
      await Payment.findByIdAndUpdate(payment._id, {
        status: "failed",
        phonepeResponse: response,
        updatedAt: new Date(),
      })

      return NextResponse.json(
        {
          success: false,
          error: response.message || "Payment initiation failed",
          code: response.code,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("PhonePe payment initiation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
