import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import PaymentMethod from "@/lib/models/payment-mothod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

// Get a specific payment method
export async function GET(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const paymentMethodId = id

    if (!mongoose.Types.ObjectId.isValid(paymentMethodId)) {
      return NextResponse.json({ error: "Invalid payment method ID" }, { status: 400 })
    }

    // Find the payment method
    const paymentMethod = await PaymentMethod.findOne({ _id: paymentMethodId, user_id: userId }).lean()

    if (!paymentMethod) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 })
    }

    return NextResponse.json({ paymentMethod })
  } catch (error) {
    console.error("Error fetching payment method:", error)
    return NextResponse.json({ error: "Failed to fetch payment method" }, { status: 500 })
  }
}

// Update a payment method
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const paymentMethodId =id
    const paymentData = await request.json()

    if (!mongoose.Types.ObjectId.isValid(paymentMethodId)) {
      return NextResponse.json({ error: "Invalid payment method ID" }, { status: 400 })
    }

    // Find the payment method
    const paymentMethod = await PaymentMethod.findOne({ _id: paymentMethodId, user_id: userId })

    if (!paymentMethod) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 })
    }

    // If this payment method is being set as default, unset any existing default
    if (paymentData.is_default && !paymentMethod.is_default) {
      await PaymentMethod.updateMany({ user_id: userId, _id: { $ne: paymentMethodId } }, { is_default: false })
    }

    // Update payment method
    const updatedPaymentMethod = await PaymentMethod.findByIdAndUpdate(
      paymentMethodId,
      {
        card_type: paymentData.card_type || paymentMethod.card_type,
        last_four: paymentData.last_four || paymentMethod.last_four,
        expiry_month: paymentData.expiry_month || paymentMethod.expiry_month,
        expiry_year: paymentData.expiry_year || paymentMethod.expiry_year,
        is_default: paymentData.is_default || false,
      },
      { new: true },
    )

    return NextResponse.json({
      message: "Payment method updated successfully",
      paymentMethod: updatedPaymentMethod,
    })
  } catch (error) {
    console.error("Error updating payment method:", error)
    return NextResponse.json({ error: "Failed to update payment method" }, { status: 500 })
  }
}

// Delete a payment method
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const paymentMethodId = id

    if (!mongoose.Types.ObjectId.isValid(paymentMethodId)) {
      return NextResponse.json({ error: "Invalid payment method ID" }, { status: 400 })
    }

    // Find the payment method
    const paymentMethod = await PaymentMethod.findOne({ _id: paymentMethodId, user_id: userId })

    if (!paymentMethod) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 })
    }

    // Check if this is the default payment method
    const isDefault = paymentMethod.is_default

    // Delete the payment method
    await PaymentMethod.findByIdAndDelete(paymentMethodId)

    // If this was the default payment method, set a new default if there are other payment methods
    if (isDefault) {
      const anotherPaymentMethod = await PaymentMethod.findOne({ user_id: userId })
      if (anotherPaymentMethod) {
        anotherPaymentMethod.is_default = true
        await anotherPaymentMethod.save()
      }
    }

    return NextResponse.json({ message: "Payment method deleted successfully" })
  } catch (error) {
    console.error("Error deleting payment method:", error)
    return NextResponse.json({ error: "Failed to delete payment method" }, { status: 500 })
  }
}
