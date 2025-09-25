import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/lib/models"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const name = searchParams.get("name") || ""
    const email = searchParams.get("email") || ""
    const skip = (page - 1) * limit

    await connectToDatabase()

    // Build query based on filters
    const query: any = {}

    if (name) {
      query.name = { $regex: name, $options: "i" }
    }

    if (email) {
      query.email = { $regex: email, $options: "i" }
    }

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select("-password") // Exclude password field
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ])

    const totalPages = Math.ceil(totalUsers / limit)

    return NextResponse.json({
      users,
      meta: {
        totalUsers,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
