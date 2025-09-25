import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Order } from "@/lib/models/order"

export async function GET() {
  try {
    await connectToDatabase()

    // Group orders by month and calculate total sales
    const salesByMonth = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$total" },
        },
      },
      {
        $project: {
          month: "$_id",
          total: 1,
          _id: 0,
        },
      },
      {
        $sort: { month: 1 },
      },
    ])

    // Map month numbers to month names
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ]

    const fullData = months.map((name, index) => {
      const monthData = salesByMonth.find((m) => m.month === index + 1)
      return {
        name,
        total: monthData ? monthData.total : 0,
      }
    })

    return NextResponse.json(fullData)
  } catch (err) {
    console.error("Error fetching sales data:", err)
    return NextResponse.json({ message: "Server Error" }, { status: 500 })
  }
}
