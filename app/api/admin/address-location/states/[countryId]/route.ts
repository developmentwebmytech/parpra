import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { State } from "@/lib/models/Location"

// GET states by country ID
export async function GET(req: Request, { params }: { params: { countryId: string } }) {
  await connectToDatabase()
  const { countryId } = params

  console.log("Fetching states for countryId:", countryId)

  try {
    const states = await State.find({ country: countryId })
      .populate("country", "name code")
      .sort({ name: 1 })

    console.log("Found states:", states.length)
    return NextResponse.json(states, { status: 200 })
  } catch (error) {
    console.error("Error fetching states:", error)
    return NextResponse.json({ message: "Error fetching states", error }, { status: 500 })
  }
}
