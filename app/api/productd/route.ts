import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Product } from "@/lib/models"

export async function GET() {
  try {
    await connectToDatabase()

    // Populate only variations to get image and createdAt (or price)
    const products = await Product.find({})
      .select("name variations") // Only fetch what's needed
      .populate({
        path: "variations",
        select: "price image createdAt", // Minimal required fields
        options: { sort: { createdAt: -1 } }, // Optional: get latest variation first
      }).limit(5) // Limit to 10 products for performance

    return NextResponse.json(products)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
