"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface BackButtonProps {
  label?: string
  section: "products" | "categories" | "brands" | "variations"
}

export function BackButton({ label = "Back", section }: BackButtonProps) {
  const router = useRouter()

  // Define unique colors for each section
  const sectionColors = {
    products: "bg-teal-600 hover:bg-teal-800",
    categories: "bg-teal-600 hover:bg-teal-800",
    brands: "bg-teal-600 hover:bg-teal-800",
    variations: "bg-teal-600 hover:bg-teal-800",
  }

  return (
    <Button onClick={() => router.back()} className={`${sectionColors[section]} text-white`} size="sm">
      <ArrowLeft className="h-4 w-4 text-md " />
      {label}
    </Button>
  )
}
