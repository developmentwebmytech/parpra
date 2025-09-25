import { type NextRequest, NextResponse } from "next/server"
import {connectToDatabase} from "@/lib/mongodb"
import StoreLocation from "@/lib/models/StoreLocation"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const body = await request.json()
    const location = await StoreLocation.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    return NextResponse.json(location)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const location = await StoreLocation.findByIdAndDelete(params.id)

    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Location deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 })
  }
}
