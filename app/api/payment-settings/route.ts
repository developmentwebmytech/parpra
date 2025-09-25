import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import PaymentSetting from "@/lib/models/payment-setting"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Get payment settings
export async function GET() {
  try {
    await connectToDatabase()

    // Find or create payment settings
    let settings = await PaymentSetting.findOne({})

    if (!settings) {
      settings = await PaymentSetting.create({
        cod_enabled: true,
        cod_min_order_value: 0,
        cod_max_order_value: 10000,
        online_payment_enabled: true,
        paypal_enabled: true,
        bank_transfer_enabled: true,
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching payment settings:", error)
    return NextResponse.json({ error: "Failed to fetch payment settings" }, { status: 500 })
  }
}

// Update payment settings (admin only)
export async function PUT(request: Request) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Find or create payment settings
    let settings = await PaymentSetting.findOne({})

    if (!settings) {
      settings = await PaymentSetting.create(data)
    } else {
      // Update existing settings
      settings.cod_enabled = data.cod_enabled !== undefined ? data.cod_enabled : settings.cod_enabled
      settings.cod_min_order_value =
        data.cod_min_order_value !== undefined ? data.cod_min_order_value : settings.cod_min_order_value
      settings.cod_max_order_value =
        data.cod_max_order_value !== undefined ? data.cod_max_order_value : settings.cod_max_order_value
      settings.online_payment_enabled =
        data.online_payment_enabled !== undefined ? data.online_payment_enabled : settings.online_payment_enabled
      settings.paypal_enabled = data.paypal_enabled !== undefined ? data.paypal_enabled : settings.paypal_enabled
      settings.bank_transfer_enabled =
        data.bank_transfer_enabled !== undefined ? data.bank_transfer_enabled : settings.bank_transfer_enabled

      await settings.save()
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating payment settings:", error)
    return NextResponse.json({ error: "Failed to update payment settings" }, { status: 500 })
  }
}
