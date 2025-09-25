import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import ShippingInfo from "@/lib/models/ShippingInfo"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()
    const { id } = await params
    const shippingInfo = await ShippingInfo.findById(id)

    if (!shippingInfo) {
      return NextResponse.json({ error: "Shipping information not found" }, { status: 404 })
    }

    return NextResponse.json(shippingInfo)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch shipping information" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()
    const data = await request.json()
    const { id } = await params
    // Update lastUpdated field
    data.lastUpdated = new Date()

    const updatedShippingInfo = await ShippingInfo.findByIdAndUpdate(id, data, { new: true })

    if (!updatedShippingInfo) {
      return NextResponse.json({ error: "Shipping information not found" }, { status: 404 })
    }

    return NextResponse.json(updatedShippingInfo)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update shipping information" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()
    const { id } = await params
    const deletedShippingInfo = await ShippingInfo.findByIdAndDelete(id)

    if (!deletedShippingInfo) {
      return NextResponse.json({ error: "Shipping information not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Shipping information deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete shipping information" }, { status: 500 })
  }
}
