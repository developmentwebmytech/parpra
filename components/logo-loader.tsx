"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import Logo from "@/public/Logo/Parpra.png"

export default function LogoLoader() {
  const [loading, setLoading] = useState(true)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    // Show loader on first load
    if (isFirstLoad) {
      const timer = setTimeout(() => {
        setLoading(false)
        setIsFirstLoad(false)
      }, 2000)
      return () => clearTimeout(timer)
    } else {
      // Show loader on navigation
      setLoading(true)
      const timer = setTimeout(() => {
        setLoading(false)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [pathname, isFirstLoad])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="relative flex flex-col items-center">
        <div className="relative h-24 w-24 md:h-32 md:w-32">
          <Image src={Logo} alt="Parpra" fill className="object-contain" priority />
        </div>

        {/* Animated dots */}
        <div className="mt-6 flex space-x-3">
          <div className="h-3 w-3 animate-bounce rounded-full bg-teal-700" style={{ animationDelay: "0ms" }}></div>
          <div className="h-3 w-3 animate-bounce rounded-full bg-teal-700" style={{ animationDelay: "300ms" }}></div>
          <div className="h-3 w-3 animate-bounce rounded-full bg-teal-700" style={{ animationDelay: "600ms" }}></div>
        </div>
      </div>
    </div>
  )
}
