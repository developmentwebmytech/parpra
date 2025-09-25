import type { Metadata } from "next"
import { BrandForm } from "@/components/brands/brand-form"
import { BackButton } from "@/components/back-button"

export const metadata: Metadata = {
  title: "Add Brand | E-commerce Admin",
  description: "Add a new brand to your store",
}

export default function NewBrandPage() {
  return (
    <div className="flex-1 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Add Brand</h2>
        <BackButton section="brands" />
      </div>
      <BrandForm />
    </div>
  )
}
