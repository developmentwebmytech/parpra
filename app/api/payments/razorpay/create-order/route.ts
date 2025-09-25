import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { RazorpayService } from "@/lib/services/razorpay"
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
    const { orderId, amount, currency = "INR" } = body

    

    if (!orderId || !amount) {
      return NextResponse.json({ error: "Order ID and amount are required" }, { status: 400 })
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Check Razorpay configuration
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        {
          success: false,
          error: "Razorpay configuration incomplete",
        },
        { status: 500 },
      )
    }

    // Initialize Razorpay service
    const razorpayService = new RazorpayService()

    // Create Razorpay order
    const receipt = `order_${orderId}_${Date.now()}`
    const response = await razorpayService.createOrder(amount, currency, receipt)

    if (response.success && response.data) {
      // Create payment record
      const payment = new Payment({
        orderId,
        userId: session.user.id,
        merchantTransactionId: response.data.id,
        amount,
        currency,
        paymentMethod: "razorpay",
        status: "pending",
        razorpayOrderId: response.data.id,
        razorpayResponse: response.data,
        createdAt: new Date(),
      })

      await payment.save()
      

      return NextResponse.json({
        success: true,
        data: {
          orderId: response.data.id,
          amount: response.data.amount,
          currency: response.data.currency,
          key: process.env.RAZORPAY_KEY_ID,
          name: "PARPRA",
          description: `Payment for Order #${orderId}`,
          image: "/parpra-logo.png",
          prefill: {
            name: session.user.name || "",
            email: session.user.email || "",
          },
          theme: {
            color: "#0f766e", // Teal color
          },
          modal: {
            ondismiss: () => {
              
            },
          },
        },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: response.error || "Failed to create Razorpay order",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Razorpay order creation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
