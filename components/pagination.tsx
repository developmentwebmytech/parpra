"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationProps {
  totalPages: number
  currentPage: number
  siblingCount?: number
}

export function Pagination({ totalPages, currentPage, siblingCount = 1 }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Create a new URLSearchParams instance to modify
  const createQueryString = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    return params.toString()
  }

  // Navigate to a specific page
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return
    const queryString = createQueryString(page)
    router.push(`${pathname}?${queryString}`)
  }

  // Generate page numbers to display
  const generatePagination = () => {
    // For mobile, just show prev/next
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      return []
    }

    // If there are fewer pages than the siblings count * 2 + 5, just show all pages
    if (totalPages <= siblingCount * 2 + 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Calculate start and end of sibling range
    const startPage = Math.max(1, currentPage - siblingCount)
    const endPage = Math.min(totalPages, currentPage + siblingCount)

    // Add ellipsis indicators
    const pages = []

    // Always include first page
    pages.push(1)

    // Add ellipsis if needed
    if (startPage > 2) {
      pages.push(-1) // -1 represents ellipsis
    } else if (startPage === 2) {
      pages.push(2)
    }

    // Add sibling pages
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i)
      }
    }

    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
      pages.push(-2) // -2 represents ellipsis
    } else if (endPage === totalPages - 1) {
      pages.push(totalPages - 1)
    }

    // Always include last page
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  const pages = generatePagination()

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => goToPage(1)}
        disabled={currentPage === 1}
        aria-label="Go to first page"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="hidden sm:flex items-center space-x-2">
        {pages.map((page, i) => {
          // Render ellipsis
          if (page < 0) {
            return (
              <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
                ...
              </span>
            )
          }

          // Render page number
          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              onClick={() => goToPage(page)}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </Button>
          )
        })}
      </div>

      {/* Mobile page indicator */}
      <span className="sm:hidden text-sm">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="icon"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => goToPage(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Go to last page"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
