import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { MegaMenuConfig } from "@/lib/models/mega-menu-config"

export async function GET() {
  try {
    await connectToDatabase()
    const configs = await MegaMenuConfig.find().lean()

    return NextResponse.json(
      configs.map((config: any) => ({
        ...config,
        _id: config._id.toString(),
      })),
    )
  } catch (error) {
    console.error("Error fetching mega menu configs:", error)
    return NextResponse.json({ error: "Failed to fetch mega menu configs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase()
    const data = await request.json()

    const config = new MegaMenuConfig(data)
    await config.save()

    return NextResponse.json(
      {
        ...config.toObject(),
        _id: config._id.toString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating mega menu config:", error)
    return NextResponse.json({ error: "Failed to create mega menu config" }, { status: 500 })
  }
}
