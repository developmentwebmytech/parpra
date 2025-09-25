import type { Metadata } from "next"
import { getProductById, getBrands, getCategories } from "@/lib/data"
import { ProductForm } from "@/components/products/product-form"
import { BackButton } from "@/components/back-button"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Edit Product | E-commerce Admin",
  description: "Edit a product in your store",
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const param = await params
  const [product, { brands }, { categories }] = await Promise.all([
    getProductById(param.id),
    getBrands({ page: 1, per_page: 100 }),
    getCategories({ page: 1, per_page: 100 }),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
        <BackButton section="products" />
      </div>
      <ProductForm product={product} brands={brands} categories={categories} />
    </div>
  )
}
