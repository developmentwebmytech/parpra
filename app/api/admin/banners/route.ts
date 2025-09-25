import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Banner from "@/lib/models/banner"

export async function GET(request: Request) {
  try {
    await connectToDatabase()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string, 10) : undefined
    const isActive = searchParams.get("active") === "true" ? true : undefined

    // Build query
    const query: any = {}
    if (isActive !== undefined) {
      query.isActive = isActive
    }

    // Get banners
    let bannersQuery = Banner.find(query).sort({ position: 1 })
    if (limit) {
      bannersQuery = bannersQuery.limit(limit)
    }

    const banners = await bannersQuery.lean()

    // Format response
    const formattedBanners = banners.map((banner: any) => ({
      ...banner,
      _id: banner._id.toString(),
    }))

    return NextResponse.json(formattedBanners)
  } catch (error) {
    console.error("Error fetching banners:", error)
    return NextResponse.json({ message: "Failed to fetch banners" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase()

    // Parse request body
    const data = await request.json()

    // Validate required fields
    if (!data.title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 })
    }

    if (!data.image) {
      return NextResponse.json({ message: "Image is required" }, { status: 400 })
    }

    // Remove _id if it exists and is empty
    if (data._id === "") {
      delete data._id
    }


    // Create the banner
    const banner = new Banner(data)
    await banner.save()

    return NextResponse.json({
      ...banner.toObject(),
      _id: banner._id.toString(),
    })
  } catch (error: any) {
    console.error("Error creating banner:", error)

    // Handle validation errors
    if (error.name === "ValidationError") {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: "Failed to create banner" }, { status: 500 })
  }
}
