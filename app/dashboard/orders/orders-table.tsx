"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, Search, Filter, ArrowUpDown, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export function OrdersTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  interface Order {
    _id: string;
    order_number: string;
    shipping_address?: { full_name: string };
    createdAt: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total: number;
    items: any[];
  }
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState("createdAt")
  const [sortDirection, setSortDirection] = useState("desc")

  const page = Number(searchParams.get("page") || "1")
  const limit = 10
const fetchOrders =useCallback( async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortField,
        sortDirection,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`/api/admin/orders?${queryParams.toString()}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.orders)
        setTotalPages(Math.ceil(data.total / limit))
      } else {
        console.error("Failed to fetch orders:", data.error)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, sortField, sortDirection, searchTerm])
  useEffect(() => {
    fetchOrders()
  }, [page, statusFilter, sortField, sortDirection,fetchOrders])

  

  const handleSearch = (e : React.FormEvent) => {
    e.preventDefault()
    router.push(`/dashboard/orders?page=1&status=${statusFilter}`)
    fetchOrders()
  }

  const handleSort = (field : string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleStatusChange = (value: 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
    setStatusFilter(value)
    router.push(`/dashboard/orders?page=1&status=${value}`)
  }

  const getStatusBadge = (status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      processing: "bg-blue-100 text-blue-800 border-blue-200",
      shipped: "bg-purple-100 text-purple-800 border-purple-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    }

    return (
      <Badge className={`${statusStyles[status]} border`}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
    )
  }

  return (
    <div>
      <div className="border-b p-4">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              placeholder="Search order #, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9"
            />
            <Button type="submit" size="sm" variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Status:</span>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort("order_number")}>
                <div className="flex items-center space-x-1">
                  <span>Order #</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort("createdAt")}>
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 cursor-pointer" onClick={() => handleSort("total")}>
                <div className="flex items-center space-x-1">
                  <span>Total</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-6 py-3">Items</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                  </tr>
                ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{order.order_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.shipping_address?.full_name || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.items.length}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link href={`/dashboard/orders/${order._id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t">
        <div className="text-sm text-gray-500">
          Showing page {page} of {totalPages}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/orders?page=${page - 1}&status=${statusFilter}`)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/orders?page=${page + 1}&status=${statusFilter}`)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
