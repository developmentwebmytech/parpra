"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type SidebarContextType = {
  isCollapsed: boolean
  toggleSidebar: () => void
  sidebarWidth: number
  setSidebarWidth: (width: number) => void
  defaultWidth: number
}

const defaultWidth = 240
const minWidth = 180
const maxWidth = 400

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggleSidebar: () => {},
  sidebarWidth: defaultWidth,
  setSidebarWidth: () => {},
  defaultWidth,
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(defaultWidth)

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const storedCollapsed = localStorage.getItem("sidebar-collapsed")
    const storedWidth = localStorage.getItem("sidebar-width")

    if (storedCollapsed) {
      setIsCollapsed(storedCollapsed === "true")
    }

    if (storedWidth) {
      const width = Number.parseInt(storedWidth)
      if (width >= minWidth && width <= maxWidth) {
        setSidebarWidth(width)
      }
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("sidebar-collapsed", String(newState))
  }

  const handleSetSidebarWidth = (width: number) => {
    // Ensure width is within bounds
    const newWidth = Math.max(minWidth, Math.min(maxWidth, width))
    setSidebarWidth(newWidth)
    localStorage.setItem("sidebar-width", String(newWidth))
  }

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleSidebar,
        sidebarWidth,
        setSidebarWidth: handleSetSidebarWidth,
        defaultWidth,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)
