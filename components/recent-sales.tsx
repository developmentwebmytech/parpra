"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Variation {
  price: number
  createdAt: string
  image?: string
}

interface Product {
  _id: string
  name: string
  variations: Variation[]
}

export function RecentSales() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/productd")
        const data = await res.json()
        if (Array.isArray(data)) {
          setProducts(data)
        } else {
          console.error("Expected array but got:", data)
        }
      } catch (error) {
        console.error("Failed to fetch products:", error)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-8">
      {products.map((product) => {
        const variation = product.variations?.[0]
        const price = variation?.price || 0
        const image = variation?.image
        const createdAt = variation?.createdAt || ""
        const timeAgo = getTimeAgo(createdAt)

        return (
          <div key={product._id} className="flex items-center gap-3">
            {image ? (
              <Image
                src={image}
                alt={product.name}
                width={36}
                height={36}
                className="rounded-full object-cover h-9 w-9"
              />
            ) : (
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {product.name
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="ml-2 flex-1 min-w-0 space-y-1">
              <p className="text-sm font-medium leading-none truncate">{product.name}</p>
              <p className="text-sm text-muted-foreground">Added {timeAgo}</p>
            </div>
            <div className="ml-auto font-medium">+₹ {price.toFixed(2)}</div>
          </div>
        )
      })}
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  return `${Math.floor(diff / 86400)} day(s) ago`
}
