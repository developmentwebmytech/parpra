import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Address from "@/lib/models/address"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

// Get a specific address
export async function GET(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const addressId = id

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return NextResponse.json({ error: "Invalid address ID" }, { status: 400 })
    }

    // Find the address
    const address = await Address.findOne({ _id: addressId, user_id: userId }).lean()

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    return NextResponse.json({ address })
  } catch (error) {
    console.error("Error fetching address:", error)
    return NextResponse.json({ error: "Failed to fetch address" }, { status: 500 })
  }
}

// Update an address
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const addressId = id
    const addressData = await request.json()

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return NextResponse.json({ error: "Invalid address ID" }, { status: 400 })
    }

    // Validate required fields
    const requiredFields = ["full_name", "address_line1", "city", "state", "postal_code", "country", "phone"]
    for (const field of requiredFields) {
      if (!addressData[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Find the address
    const address = await Address.findOne({ _id: addressId, user_id: userId })

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    // If this address is being set as default, unset any existing default
    if (addressData.is_default && !address.is_default) {
      await Address.updateMany({ user_id: userId, _id: { $ne: addressId } }, { is_default: false })
    }

    // Update address
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      {
        full_name: addressData.full_name,
        address_line1: addressData.address_line1,
        address_line2: addressData.address_line2 || "",
        city: addressData.city,
        state: addressData.state,
        postal_code: addressData.postal_code,
        country: addressData.country,
        phone: addressData.phone,
        is_default: addressData.is_default || false,
      },
      { new: true },
    )

    return NextResponse.json({
      message: "Address updated successfully",
      address: updatedAddress,
    })
  } catch (error) {
    console.error("Error updating address:", error)
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 })
  }
}

// Delete an address
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const addressId = id

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return NextResponse.json({ error: "Invalid address ID" }, { status: 400 })
    }

    // Find the address
    const address = await Address.findOne({ _id: addressId, user_id: userId })

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    // Check if this is the default address
    const isDefault = address.is_default

    // Delete the address
    await Address.findByIdAndDelete(addressId)

    // If this was the default address, set a new default if there are other addresses
    if (isDefault) {
      const anotherAddress = await Address.findOne({ user_id: userId })
      if (anotherAddress) {
        anotherAddress.is_default = true
        await anotherAddress.save()
      }
    }

    return NextResponse.json({ message: "Address deleted successfully" })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
  }
}
