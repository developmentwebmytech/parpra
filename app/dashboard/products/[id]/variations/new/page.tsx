import type { Metadata } from "next"
import { getProductById } from "@/lib/data"
import { VariationForm } from "@/components/variations/variation-form"
import { BackButton } from "@/components/back-button"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Add Variation | E-commerce Admin",
  description: "Add a new product variation",
}

export default async function NewVariationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Await the params promise
  const param = await params
  const product = await getProductById(param.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="flex-1 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add Variation</h2>
          <p className="text-muted-foreground">For product: {product.name}</p>
        </div>
        <BackButton section="variations" />
      </div>
      <VariationForm productId={param.id} />
    </div>
  )
}
