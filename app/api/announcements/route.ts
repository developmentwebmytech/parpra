import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Announcement from "@/lib/models/announcement"

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()

    // Only fetch active announcements, sorted by position
    const announcements = await Announcement.find({ isActive: true }).sort({ position: 1 }).limit(3) // Limit to 3 announcements as requested

    return NextResponse.json({ announcements })
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
