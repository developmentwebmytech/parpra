import { type NextRequest, NextResponse } from "next/server"
import {connectToDatabase} from "@/lib/mongodb"
import StoreLocation from "@/lib/models/StoreLocation"

export async function GET() {
  try {
    await connectToDatabase()
    const locations = await StoreLocation.find({}).sort({ createdAt: -1 })
    // console.log(locations)
    return NextResponse.json(locations)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const body = await request.json()
    const location = await StoreLocation.create(body)
    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create location" }, { status: 500 })
  }
}
