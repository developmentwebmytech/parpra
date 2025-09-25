"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ICategory } from "@/lib/models"
import { debounce } from "lodash"

interface CategoriesFilterProps {
  parentCategories: ICategory[]
}

export function CategoriesFilter({ parentCategories }: CategoriesFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [name, setName] = useState(searchParams.get("name") || "")
  const [parentId, setParentId] = useState(searchParams.get("parent_id") || "")

  // Debounced function to update URL
  const debouncedUpdateUrl = debounce((name: string, parentId: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (name) {
      params.set("name", name)
    } else {
      params.delete("name")
    }

    if (parentId) {
      params.set("parent_id", parentId)
    } else {
      params.delete("parent_id")
    }

    // Reset to page 1 when filtering
    params.set("page", "1")

    router.push(`${pathname}?${params.toString()}`)
  }, 500) // 500ms debounce time

  // Update URL when filters change
  useEffect(() => {
    debouncedUpdateUrl(name, parentId)

    // Cleanup
    return () => {
      debouncedUpdateUrl.cancel()
    }
  }, [name, parentId, debouncedUpdateUrl])

  const handleReset = () => {
    setName("")
    setParentId("")
  }

  const handleParentChange = (value: string) => {
    setParentId(value === "all" ? "" : value)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-6">
      <div className="flex-1 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by category name..."
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

        <div className="w-full sm:w-[200px]">
          <Select value={parentId} onValueChange={handleParentChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by parent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="none">No Parent</SelectItem>
              {parentCategories.map((category) => (
                <SelectItem key={category._id.toString()} value={category._id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
