import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Address from "@/lib/models/address"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

// Get all addresses for the user
export async function GET() {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Find all addresses for the user
    const addresses = await Address.find({ user_id: userId }).sort({ is_default: -1, createdAt: -1 }).lean()

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error("Error fetching addresses:", error)
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 })
  }
}

// Create a new address
export async function POST(request: Request) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const addressData = await request.json()

    // Validate required fields
    const requiredFields = ["full_name", "address_line1", "city", "state", "postal_code", "country", "phone"]
    for (const field of requiredFields) {
      if (!addressData[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Check if this is the first address (make it default)
    const addressCount = await Address.countDocuments({ user_id: userId })
    const isDefault = addressCount === 0 ? true : addressData.is_default || false

    // If this address is set as default, unset any existing default
    if (isDefault) {
      await Address.updateMany({ user_id: userId }, { is_default: false })
    }

    // Create new address
    const newAddress = new Address({
      user_id: new mongoose.Types.ObjectId(userId),
      full_name: addressData.full_name,
      address_line1: addressData.address_line1,
      address_line2: addressData.address_line2 || "",
      city: addressData.city,
      state: addressData.state,
      postal_code: addressData.postal_code,
      country: addressData.country,
      phone: addressData.phone,
      is_default: isDefault,
    })

    await newAddress.save()

    return NextResponse.json({
      message: "Address created successfully",
      address: newAddress,
    })
  } catch (error) {
    console.error("Error creating address:", error)
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 })
  }
}
