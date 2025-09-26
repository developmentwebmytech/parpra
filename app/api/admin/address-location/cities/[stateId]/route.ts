import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { CityTown } from "@/lib/models/Location"

// GET cities by state ID
export async function GET(req: Request, { params }: { params: { stateId: string } }) {
  await connectToDatabase()

  const { stateId } = params

  try {
    const cities = await CityTown.find({ state: stateId })
      .populate("country", "name code")
      .populate("state", "name code")
      .sort({ name: 1 })

    return NextResponse.json(cities, { status: 200 })
  } catch (error) {
    console.error("Error fetching cities:", error)
    return NextResponse.json({ message: "Error fetching cities", error }, { status: 500 })
  }
}
