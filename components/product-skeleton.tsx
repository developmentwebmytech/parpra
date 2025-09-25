import { Skeleton } from "@/components/ui/skeleton"

export function ProductDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image skeleton */}
        <div className="aspect-square rounded-lg overflow-hidden">
          <Skeleton className="h-full w-full" />
        </div>

        {/* Product details skeleton */}
        <div className="flex flex-col space-y-6">
          {/* Title */}
          <Skeleton className="h-10 w-3/4" />

          {/* Price */}
          <Skeleton className="h-8 w-1/4" />

          {/* Rating */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-5 rounded-full" />
            ))}
            <Skeleton className="h-5 w-16 ml-2" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Size selector */}
          <div>
            <Skeleton className="h-6 w-20 mb-2" />
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-md" />
              ))}
            </div>
          </div>

          {/* Color selector */}
          <div>
            <Skeleton className="h-6 w-20 mb-2" />
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-full" />
              ))}
            </div>
          </div>

          {/* Add to cart button */}
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>

      {/* Product details tabs */}
      <div className="mt-12">
        <div className="flex border-b mb-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 mr-4" />
          ))}
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>

      {/* Related products */}
      <div className="mt-16">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
