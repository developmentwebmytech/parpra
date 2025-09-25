import type { Metadata } from "next"
import { getBrandById } from "@/lib/data"
import { BrandForm } from "@/components/brands/brand-form"
import { BackButton } from "@/components/back-button"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Edit Brand | E-commerce Admin",
  description: "Edit a brand in your store",
}

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Await the params promise
  const param = await params
  const brand = await getBrandById(param.id)

  if (!brand) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Edit Brand</h2>
        <BackButton section="brands" />
      </div>
      <BrandForm brand={brand} />
    </div>
  )
}
