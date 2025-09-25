import type { Metadata } from "next"
import { getProductById, getVariationsByProductId } from "@/lib/data"
import { VariationsTable } from "@/components/variations/variations-table"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/back-button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Product Variations | E-commerce Admin",
  description: "Manage product variations",
}

export default async function ProductVariationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string; per_page?: string }>
}) {
  // Await the params and searchParams promises
  const paramsObj = await params
  const searchParamsObj = await searchParams
  const page = Number(searchParamsObj.page) || 1
  const per_page = Number(searchParamsObj.per_page) || 10

  const [product, { variations, totalPages }] = await Promise.all([
    getProductById(paramsObj.id),
    getVariationsByProductId(paramsObj.id, { page, per_page }),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="flex-1  pt-9 md:p-8">
      <div className="flex items-center justify-between gap-7">
        <div >
          <h2 className="text-3xl font-bold  tracking-tight leading-14">Variations for {product.name}</h2>
          <p className="text-muted-foreground mb-3">Manage product variations</p>
        </div>
        <div className="flex gap-2">
          <BackButton section="products" />
          <Button asChild  className="hover:bg-teal-700 hover:text-white transition">
            <Link href={`/dashboard/products/${paramsObj.id}/variations/new`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Variation
            </Link>
          </Button>
        </div>
      </div>
      <VariationsTable
        productId={paramsObj.id}
        variations={variations}
        totalPages={totalPages}
        page={page}
        per_page={per_page}
      />
    </div>
  )
}
