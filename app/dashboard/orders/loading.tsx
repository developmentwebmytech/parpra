export default function DashboardOrdersLoading() {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-10 w-40 bg-gray-200 animate-pulse rounded mb-4"></div>
          <div className="h-8 w-60 bg-gray-200 animate-pulse rounded mb-2"></div>
          <div className="h-4 w-80 bg-gray-200 animate-pulse rounded"></div>
        </div>
  
        <div className="rounded-lg border bg-white shadow p-4">
          <div className="space-y-4">
            <div className="h-8 w-full bg-gray-200 animate-pulse rounded"></div>
            <div className="h-20 w-full bg-gray-200 animate-pulse rounded"></div>
            <div className="h-20 w-full bg-gray-200 animate-pulse rounded"></div>
            <div className="h-20 w-full bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    )
  }
  