"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoLoaderProps {
  minDisplayTime?: number
  className?: string
}

export default function EnhancedLogoLoader({ minDisplayTime = 2000, className }: LogoLoaderProps) {
  const [loading, setLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true)

      setTimeout(() => {
        setLoading(false)
      }, 500) // Match this with the fade-out animation duration
    }, minDisplayTime)

    return () => clearTimeout(timer)
  }, [minDisplayTime])

  if (!loading) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-white",
        fadeOut ? "animate-fade-out" : "animate-fade-in",
        className,
      )}
    >
      <div className="relative flex flex-col items-center">
        {/* Logo with subtle animation */}
        <div className="relative h-28 w-28 md:h-36 md:w-36 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute h-full w-full animate-pulse opacity-20 rounded-full bg-primary/20"></div>
            <div className="absolute h-[90%] w-[90%] animate-pulse opacity-30 rounded-full bg-primary/30 delay-75"></div>
            <div className="absolute h-[80%] w-[80%] animate-pulse opacity-40 rounded-full bg-primary/40 delay-150"></div>
          </div>
          <Image src="/Logo/parpra.png" alt="Parpra" fill className="object-contain z-10 relative" priority />
        </div>

        {/* Animated progress bar */}
        <div className="mt-8 flex items-center justify-center w-full">
          <div className="relative h-1 w-56 overflow-hidden rounded-full bg-gray-100">
            <div className="animate-loader absolute left-0 top-0 h-full rounded-full bg-primary"></div>
          </div>
        </div>

        {/* Loading text */}
        <div className="mt-4 text-sm text-primary/80 font-medium tracking-wider">LOADING</div>
      </div>
    </div>
  )
}
