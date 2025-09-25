import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Testimonial } from "@/lib/models/testimonial"

export async function GET() {
  try {
    await connectToDatabase()
    const testimonials = await Testimonial.find({ isActive: true }).lean()

    return NextResponse.json({
      testimonials: testimonials.map((testimonial: any) => ({
        ...testimonial,
        _id: testimonial._id.toString(),
      })),
    })
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 })
  }
}
