import { NextResponse } from "next/server"
import { RazorpayService } from "@/lib/services/razorpay"

export async function GET() {
  try {
    // Check environment variables
    const requiredEnvVars = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"]
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing environment variables: ${missingVars.join(", ")}`,
        configuration: {
          RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? "✓ Set" : "✗ Missing",
          RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? "✓ Set" : "✗ Missing",
          RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET ? "✓ Set" : "✗ Missing (Optional)",
        },
      })
    }

    // Test Razorpay service initialization
    const razorpayService = new RazorpayService()

    // Test order creation with ₹1
    const testOrder = await razorpayService.createOrder(1, "INR", `test_${Date.now()}`)

    if (testOrder.success) {
      return NextResponse.json({
        success: true,
        message: "Razorpay integration is working correctly",
        configuration: {
          RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? "✓ Set" : "✗ Missing",
          RAZORPAY_KEY_SECRET: "✓ Set",
          RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET ? "✓ Set" : "✗ Missing (Optional)",
        },
        testOrder: {
          id: testOrder.data?.id,
          amount: testOrder.data?.amount,
          currency: testOrder.data?.currency,
          status: testOrder.data?.status,
        },
      })
    } else {
      return NextResponse.json({
        success: false,
        error: testOrder.error,
        configuration: {
          RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? "✓ Set" : "✗ Missing",
          RAZORPAY_KEY_SECRET: "✓ Set",
          RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET ? "✓ Set" : "✗ Missing (Optional)",
        },
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      configuration: {
        RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? "✓ Set" : "✗ Missing",
        RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? "✓ Set" : "✗ Missing",
        RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET ? "✓ Set" : "✗ Missing (Optional)",
      },
    })
  }
}
