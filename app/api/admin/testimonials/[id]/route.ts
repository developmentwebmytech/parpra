import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Testimonial } from "@/lib/models/testimonial"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()
    const { id } = await params
    const testimonial: any = await Testimonial.findById(id).lean()

    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...testimonial,
      _id: testimonial._id.toString(),
    })
  } catch (error) {
    console.error("Error fetching testimonial:", error)
    return NextResponse.json({ error: "Failed to fetch testimonial" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()
    const { id } = await params
    const data = await request.json()

    const testimonial: any = await Testimonial.findByIdAndUpdate(id, data, { new: true }).lean()

    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...testimonial,
      _id: testimonial._id.toString(),
    })
  } catch (error) {
    console.error("Error updating testimonial:", error)
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    await connectToDatabase()
    const { id } = await params
    const testimonial = await Testimonial.findByIdAndDelete(id)

    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting testimonial:", error)
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 })
  }
}
