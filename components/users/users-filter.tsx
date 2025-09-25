"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { debounce } from "lodash"

export function UsersFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [name, setName] = useState(searchParams.get("name") || "")
  const [email, setEmail] = useState(searchParams.get("email") || "")

  // Debounced function to update URL
  const debouncedUpdateUrl = debounce((name: string, email: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (name) {
      params.set("name", name)
    } else {
      params.delete("name")
    }

    if (email) {
      params.set("email", email)
    } else {
      params.delete("email")
    }

    // Reset to page 1 when filtering
    params.set("page", "1")

    router.push(`${pathname}?${params.toString()}`)
  }, 500) // 500ms debounce time

  // Update URL when filters change
  useEffect(() => {
    debouncedUpdateUrl(name, email)

    // Cleanup
    return () => {
      debouncedUpdateUrl.cancel()
    }
  }, [name, email, debouncedUpdateUrl])

  const handleReset = () => {
    setName("")
    setEmail("")
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-6">
      <div className="flex-1 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name..."
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

        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by email..."
            className="pl-8"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {email && (
            <button
              type="button"
              onClick={() => setEmail("")}
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
