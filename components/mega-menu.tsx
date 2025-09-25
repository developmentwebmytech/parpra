"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import type { MegaMenuSection } from "@/types"

interface MegaMenuProps {
  sections: MegaMenuSection[]
  featuredImage?: string
  featuredImageAlt?: string
}

export default function MegaMenu({ sections, featuredImage, featuredImageAlt }: MegaMenuProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className="bg-white shadow-xl border-t w-full" style={{ zIndex: 9999 }}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {sections.map((section, idx) => (
            <div key={idx} className={isMobile ? "" : idx === sections.length - 1 ? "col-span-1" : "col-span-1"}>
              <h3 className="text-amber-700 font-medium mb-4 uppercase">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i}>
                    <Link
                      href={item.url}
                      className="text-gray-700 hover:text-amber-700 transition-colors duration-200 block py-1"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {featuredImage && !isMobile && (
            <div className="col-span-1">
              <div className="relative h-full min-h-[400px] w-full overflow-hidden rounded-md">
                <Image
                  src={featuredImage || "/placeholder.svg"}
                  alt={featuredImageAlt || "Featured product"}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
