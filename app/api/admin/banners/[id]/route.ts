import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Banner from "@/lib/models/banner"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()

    const { id } = await params
    const banner: any = await Banner.findById(id).lean()

    if (!banner) {
      return NextResponse.json({ message: "Banner not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...banner,
      _id: banner._id.toString(),
    })
  } catch (error) {
    console.error("Error fetching banner:", error)
    return NextResponse.json({ message: "Failed to fetch banner" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()

    const { id } = await params
    const data = await request.json()

    // Validate required fields
    if (!data.title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 })
    }

    if (!data.image) {
      return NextResponse.json({ message: "Image is required" }, { status: 400 })
    }

    // Make sure _id matches the URL parameter
    delete data._id

    const updatedBanner: any = await Banner.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean()

    if (!updatedBanner) {
      return NextResponse.json({ message: "Banner not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...updatedBanner,
      _id: updatedBanner._id.toString(),
    })
  } catch (error: any) {
    console.error("Error updating banner:", error)

    if (error.name === "ValidationError") {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: "Failed to update banner" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()

    const { id } = await params
    const deletedBanner: any = await Banner.findByIdAndDelete(id).lean()

    if (!deletedBanner) {
      return NextResponse.json({ message: "Banner not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...deletedBanner,
      _id: deletedBanner._id.toString(),
    })
  } catch (error) {
    console.error("Error deleting banner:", error)
    return NextResponse.json({ message: "Failed to delete banner" }, { status: 500 })
  }
}
