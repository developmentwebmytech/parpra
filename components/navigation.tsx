"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

function NavigationContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q")

  return (
    <nav>
      {/* Your navigation content */}
      {query && <span>Searching for: {query}</span>}
    </nav>
  )
}

function NavigationFallback() {
  return (
    <nav>
      {/* Fallback navigation without search params */}
      <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
    </nav>
  )
}

export default function Navigation() {
  return (
    <Suspense fallback={<NavigationFallback />}>
      <NavigationContent />
    </Suspense>
  )
}
