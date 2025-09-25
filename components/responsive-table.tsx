"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ResponsiveTableProps {
  headers: string[]
  data: any[]
  renderRow: (item: any, isExpanded: boolean) => React.ReactNode
  renderExpandedContent?: (item: any) => React.ReactNode
  keyField: string
  className?: string
}

export function ResponsiveTable({
  headers,
  data,
  renderRow,
  renderExpandedContent,
  keyField,
  className,
}: ResponsiveTableProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className={cn("w-full overflow-auto", className)}>
      {/* Desktop view */}
      <table className="hidden w-full md:table">
        <thead>
          <tr className="border-b">
            {headers.map((header, i) => (
              <th key={i} className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item[keyField]} className="border-b">
              {renderRow(item, false)}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {data.map((item) => {
          const isExpanded = expandedRows[item[keyField]] || false
          return (
            <div key={item[keyField]} className="border rounded-md">
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => toggleRow(item[keyField])}
              >
                <div className="flex-1">{renderRow(item, true)}</div>
                <div className="ml-2">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
              {isExpanded && renderExpandedContent && (
                <div className="border-t p-4 bg-muted/30">{renderExpandedContent(item)}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
