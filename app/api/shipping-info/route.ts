import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import ShippingInfo from "@/lib/models/ShippingInfo"

export async function GET() {
  try {
    await connectToDatabase()
    const shippingInfo = await ShippingInfo.find({}).sort({ order: 1 })
    return NextResponse.json(shippingInfo)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch shipping information" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const data = await request.json()

    // Update lastUpdated field
    data.lastUpdated = new Date()

    const newShippingInfo = await ShippingInfo.create(data)
    return NextResponse.json(newShippingInfo, { status: 201 })
  } catch (error) {
    console.error("Error creating shipping information:", error)
    return NextResponse.json({ error: "Failed to create shipping information" }, { status: 500 })
  }
}
