import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Collection from "@/lib/models/collection"

export async function GET(request: Request) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined

    let query = {}

    if (featured === "true") {
      query = { featured: true }
    }

    let collectionsQuery = Collection.find(query)

    if (limit) {
      collectionsQuery = collectionsQuery.limit(limit)
    }

    const collections = await collectionsQuery.sort({ createdAt: -1 })

    // Add a check to ensure collections is an array
    if (!Array.isArray(collections)) {
      console.error("Collections is not an array:", collections)
      return NextResponse.json({ collections: [] })
    }

    return NextResponse.json({ collections })
  } catch (error) {
    console.error("Error fetching collections:", error)
    // Return an empty array instead of an error to prevent console errors
    return NextResponse.json({ collections: [] }, { status: 200 })
  }
}
