import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { HomepageSection } from "@/lib/models/homepage-section"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {

    await connectToDatabase()
    const { id } = await params
    const section: any = await HomepageSection.findById(id).lean()

    if (!section) {
      return NextResponse.json({ error: "Homepage section not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...section,
      _id: section._id.toString(),
    })
  } catch (error) {
    console.error("Error fetching homepage section:", error)
    return NextResponse.json({ error: "Failed to fetch homepage section" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()
    const data = await request.json()
    const { id } = await params
    const section: any = await HomepageSection.findByIdAndUpdate(id, data, { new: true }).lean()

    if (!section) {
      return NextResponse.json({ error: "Homepage section not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...section,
      _id: section._id.toString(),
    })
  } catch (error) {
    console.error("Error updating homepage section:", error)
    return NextResponse.json({ error: "Failed to update homepage section" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()
    const { id } = await params
    const section: any = await HomepageSection.findByIdAndDelete(id)

    if (!section) {
      return NextResponse.json({ error: "Homepage section not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting homepage section:", error)
    return NextResponse.json({ error: "Failed to delete homepage section" }, { status: 500 })
  }
}
