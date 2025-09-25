import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Newsletter } from "@/lib/models/newsletter"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const subscribers = await Newsletter.find({ status: "subscribed" }).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ subscribers })
  } catch (error) {
    console.error("Error fetching subscribers:", error)
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
  }
}
