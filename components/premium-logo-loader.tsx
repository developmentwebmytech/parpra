"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import Logo from "@/public/Logo/Parpra.png"

interface PremiumLogoLoaderProps {
  minDisplayTime?: number
  className?: string
}

export default function PremiumLogoLoader({ minDisplayTime = 2500, className }: PremiumLogoLoaderProps) {
  const [loading, setLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 - prev) * 0.1
        return Math.min(newProgress, 99)
      })
    }, 100)

    const timer = setTimeout(() => {
      setProgress(100)
      setFadeOut(true)

      setTimeout(() => {
        setLoading(false)
      }, 600)
    }, minDisplayTime)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [minDisplayTime])

  if (!loading) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white",
        fadeOut ? "animate-fade-out" : "animate-fade-in",
        className,
      )}
    >
      <div className="relative flex flex-col items-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[200px] w-[200px] rounded-full bg-primary/5 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-primary/3 animate-pulse delay-300"></div>
        </div>

        {/* Logo container with animations */}
        <div className="relative h-32 w-32 md:h-40 md:w-40">
          {/* Animated rings */}
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0, 77, 64, 0.1)" strokeWidth="2" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * progress) / 100}
              className="transition-all duration-300 ease-out"
            />
          </svg>

          {/* Logo image */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Image src={Logo} alt="Parpra" width={120} height={120} className="object-contain" priority />
          </div>
        </div>

        {/* Loading text */}
        <div className="mt-6 text-sm font-medium tracking-widest text-primary">{Math.round(progress)}%</div>
      </div>
    </div>
  )
}
