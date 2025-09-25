import { notFound } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import {Order} from "@/lib/models/order"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { OrderDetail } from "./order-detail"

interface OrderDetailPageProps {
  params: Promise<{
    id: string
  }>
}

async function getOrderById(id: string) {
  await connectToDatabase()
  const order = await Order.findById(id).lean()

  if (!order) {
    return null
  }

  // Convert Mongoose document to plain object and handle ObjectId
  return JSON.parse(JSON.stringify(order))
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    notFound()
  }

  if (!id) {
    notFound()
  }

  try {
    const order = await getOrderById(id)

    if (!order) {
      notFound()
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <OrderDetail order={order} />
      </div>
    )
  } catch (error) {
    console.error("Error fetching order:", error)
    throw new Error(`Error fetching order: ${error instanceof Error ? error.message : String(error)}`)
  }
}
