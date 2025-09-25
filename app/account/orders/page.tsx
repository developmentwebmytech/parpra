"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Clock, Package, Truck, CheckCircle, AlertCircle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import UserAccountSidebar from "@/components/user-account-sidebar"

interface OrderItem {
  _id: string
  product_id: string
  variation_id: string
  quantity: number
  price: number
  name: string
  image: string
  size: string
  color: string
}

interface Order {
  _id: string
  user_id: string
  order_number: string
  items: OrderItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "returned" | "return_requested"
  payment_method: string
  payment_status: "pending" | "paid" | "failed"
  createdAt: string
  updatedAt: string
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/orders")
      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }

      const data = await response.json()
     
       setOrders(data.orders)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
    if (status === "unauthenticated") {
      router.push("/login?redirect=/account/orders")
    }

    if (status === "authenticated") {
      fetchOrders()
    }
  }, [status, router, toast])

  

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-500" />
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "cancelled":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "returned":
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Order Pending"
      case "processing":
        return "Order Processing"
      case "shipped":
        return "Order Shipped"
      case "delivered":
        return "Order Delivered"
      case "cancelled":
        return "Order Cancelled"
      case "return_requested":
        return "Return Requested"
      case "returned":
        return "Order Returned"  
      default:
        return "Unknown Status"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="bg-neutral-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 lg:w-1/4">
              <Skeleton className="h-[400px] w-full rounded-md" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-12 w-1/3 mb-6" />
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[100px] w-full rounded-md mb-4" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <UserAccountSidebar activeItem="orders" />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white p-6 rounded-md shadow-sm">
              <h1 className="text-2xl font-medium mb-6">My Orders</h1>

              {orders?.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-medium mb-2">No Orders Yet</h2>
                  <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                  <Link href="/products">
                    <Button className="bg-amber-700 hover:bg-amber-800">Start Shopping</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders?.map((order) => (
                    <Link
                      key={order._id}
                      href={`/account/orders/${order._id}`}
                      className="block border rounded-md p-4 hover:border-amber-700 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                          <div className="flex items-center mb-2">
                            {getStatusIcon(order.status)}
                            <span className="ml-2 font-medium">{getStatusText(order.status)}</span>
                          </div>
                          <p className="text-sm text-gray-500">Order #{order.order_number}</p>
                          <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center justify-between w-full md:w-auto">
                          <div className="md:mr-8">
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="font-medium">₹{order.total.toLocaleString("en-IN")}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
