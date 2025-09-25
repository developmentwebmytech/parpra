import { Suspense } from "react"
import { OrdersTable } from "./orders-table"
import { OrdersTableSkeleton } from "./orders-table-skeleton"

export const metadata = {
  title: "Order Management | Admin Dashboard",
  description: "Manage customer orders and update order statuses",
}

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-6 py-9">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold leading-12">Order Management</h1>
          <p className="text-gray-500">View and manage customer orders</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white shadow">
        <Suspense fallback={<OrdersTableSkeleton />}>
          <OrdersTable />
        </Suspense>
      </div>
    </div>
  )
}
