import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Announcement from "@/lib/models/announcement"


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const announcements = await Announcement.find({}).sort({ position: 1 })

    return NextResponse.json({ announcements })
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const data = await req.json()

    // Validate required fields
    if (!data.text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Get the highest position and add 1
    const highestPosition = await Announcement.findOne().sort({ position: -1 }).select("position")
    const position = highestPosition ? highestPosition.position + 1 : 0

    const announcement = new Announcement({
      ...data,
      position,
    })

    await announcement.save()

    return NextResponse.json({ announcement }, { status: 201 })
  } catch (error) {
    console.error("Error creating announcement:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
