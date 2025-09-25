"use client"

import type React from "react"

import { useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"
import { useSidebar } from "@/components/sidebar-context"
import { Button } from "@/components/ui/button"

export function ResizableSidebar() {
  const { isCollapsed, toggleSidebar, sidebarWidth, setSidebarWidth } = useSidebar()
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)

    const onMouseMove = (e: MouseEvent) => {
      if (sidebarRef.current) {
        const newWidth = e.clientX
        setSidebarWidth(newWidth)
      }
    }

    const onMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

  if (isCollapsed) {
    return (
      <div className="hidden md:flex flex-col items-center w-12 h-[calc(100vh-4rem)] border-r bg-gray-500 dark:bg-gray-900 mb-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mt-2">
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Expand Sidebar</span>
        </Button>
      </div>
    )
  }

  return (
    <aside
      ref={sidebarRef}
      className="hidden md:block h-[calc(100vh-4rem)] border-r bg-gray-50 dark:bg-gray-900 relative"
      style={{ width: `${sidebarWidth}px` }}
    >
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="absolute right-2 top-2 z-10">
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Collapse Sidebar</span>
      </Button>

      <div className="overflow-y-auto h-full">
        <DashboardNav />
      </div>

      {/* Resize handle */}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-ew-resize bg-gray-300 dark:bg-gray-700 opacity-0 hover:opacity-100"
        onMouseDown={startResizing}
      />
    </aside>
  )
}
