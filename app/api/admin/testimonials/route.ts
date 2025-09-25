import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Testimonial } from "@/lib/models/testimonial"

export async function GET() {
  try {
    await connectToDatabase()
    const testimonials = await Testimonial.find().lean()

    return NextResponse.json(
      testimonials.map((testimonial: any) => ({
        ...testimonial,
        _id: testimonial._id.toString(),
      })),
    )
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase()
    const data = await request.json()

    const testimonial = new Testimonial(data)
    await testimonial.save()

    return NextResponse.json(
      {
        ...testimonial.toObject(),
        _id: testimonial._id.toString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating testimonial:", error)
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 })
  }
}
