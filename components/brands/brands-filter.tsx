"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { debounce } from "lodash"

export function BrandsFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [name, setName] = useState(searchParams.get("name") || "")

  // Debounced function to update URL
  const debouncedUpdateUrl = debounce((name: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (name) {
      params.set("name", name)
    } else {
      params.delete("name")
    }

    // Reset to page 1 when filtering
    params.set("page", "1")

    router.push(`${pathname}?${params.toString()}`)
  }, 500) // 500ms debounce time

  // Update URL when name changes
  useEffect(() => {
    debouncedUpdateUrl(name)

    // Cleanup
    return () => {
      debouncedUpdateUrl.cancel()
    }
  }, [name, debouncedUpdateUrl])

  const handleReset = () => {
    setName("")
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-6">
      <div className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by brand name..."
            className="pl-8"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {name && (
            <button
              type="button"
              onClick={() => setName("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </button>
          )}
        </div>
      </div>
      <div>
        <Button type="button" variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  )
}
