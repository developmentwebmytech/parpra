import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import PaymentMethod from "@/lib/models/payment-mothod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

// Get all payment methods for the user
export async function GET() {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Find all payment methods for the user
    const paymentMethods = await PaymentMethod.find({ user_id: userId }).sort({ is_default: -1, createdAt: -1 }).lean()

    return NextResponse.json({ paymentMethods })
  } catch (error) {
    console.error("Error fetching payment methods:", error)
    return NextResponse.json({ error: "Failed to fetch payment methods" }, { status: 500 })
  }
}

// Create a new payment method
export async function POST(request: Request) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const paymentData = await request.json()

    // Validate required fields
    const requiredFields = ["card_type", "last_four", "expiry_month", "expiry_year"]
    for (const field of requiredFields) {
      if (!paymentData[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Check if this is the first payment method (make it default)
    const paymentCount = await PaymentMethod.countDocuments({ user_id: userId })
    const isDefault = paymentCount === 0 ? true : paymentData.is_default || false

    // If this payment method is set as default, unset any existing default
    if (isDefault) {
      await PaymentMethod.updateMany({ user_id: userId }, { is_default: false })
    }

    // Create new payment method
    const newPaymentMethod = new PaymentMethod({
      user_id: new mongoose.Types.ObjectId(userId),
      card_type: paymentData.card_type,
      last_four: paymentData.last_four,
      expiry_month: paymentData.expiry_month,
      expiry_year: paymentData.expiry_year,
      is_default: isDefault,
    })

    await newPaymentMethod.save()

    return NextResponse.json({
      message: "Payment method created successfully",
      paymentMethod: newPaymentMethod,
    })
  } catch (error) {
    console.error("Error creating payment method:", error)
    return NextResponse.json({ error: "Failed to create payment method" }, { status: 500 })
  }
}
