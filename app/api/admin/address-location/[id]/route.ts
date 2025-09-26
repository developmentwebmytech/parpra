import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Location } from "@/lib/models/Location"

// GET single location by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase()
  const { id } = params

  console.log("GET location with id:", id)

  try {
    const location = await Location.findById(id)
    if (!location) {
      console.log("Location not found")
      return NextResponse.json({ message: "Location not found" }, { status: 404 })
    }
    console.log("Found location:", location)
    return NextResponse.json(location, { status: 200 })
  } catch (error) {
    console.error("Error fetching location:", error)
    return NextResponse.json({ message: "Error fetching location", error }, { status: 500 })
  }
}

// UPDATE single location by ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase()
  const { id } = params

  console.log("PUT update location with id:", id)

  try {
    const body = await req.json()
    console.log("Request body:", body)

    const updatedLocation = await Location.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    })

    if (!updatedLocation) {
      console.log("Location not found for update")
      return NextResponse.json({ message: "Location not found" }, { status: 404 })
    }

    console.log("Updated location:", updatedLocation)
    return NextResponse.json(updatedLocation, { status: 200 })
  } catch (error) {
    console.error("Error updating location:", error)
    return NextResponse.json({ message: "Error updating location", error }, { status: 500 })
  }
}

// DELETE single location by ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase()
  const { id } = params

  console.log("DELETE location with id:", id)

  try {
    const deletedLocation = await Location.findByIdAndDelete(id)

    if (!deletedLocation) {
      console.log("Location not found for delete")
      return NextResponse.json({ message: "Location not found" }, { status: 404 })
    }

    console.log("Deleted location:", deletedLocation)
    return NextResponse.json({ message: "Location deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting location:", error)
    return NextResponse.json({ message: "Error deleting location", error }, { status: 500 })
  }
}
