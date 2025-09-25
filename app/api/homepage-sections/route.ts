import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { HomepageSection } from "@/lib/models/index"

export async function GET() {
  try {
    await connectToDatabase()
    const sections = await HomepageSection.find({ isActive: true }).sort({ position: 1 }).lean()
    return NextResponse.json({
      sections: sections.map((section: any) => ({
        ...section,
        _id: section._id.toString(),
      })),
    })
  } catch (error) {
    console.error("Error fetching homepage sections:", error)
    return NextResponse.json({ error: "Failed to fetch homepage sections" }, { status: 500 })
  }
}
