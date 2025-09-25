"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { Fragment } from "react"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()

  // Add any path-specific styles or layouts here
  return <Fragment>{children}</Fragment>
}
