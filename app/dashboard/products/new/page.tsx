import type { Metadata } from "next"
import { ProductForm } from "@/components/products/product-form"
import { getBrands, getCategories } from "@/lib/data"
import { BackButton } from "@/components/back-button"

export const metadata: Metadata = {
  title: "Add Product | E-commerce Admin",
  description: "Add a new product to your store",
}

export default async function NewProductPage() {
  const [{ brands }, { categories }] = await Promise.all([
    getBrands({ page: 1, per_page: 100 }),
    getCategories({ page: 1, per_page: 100 }),
  ])

  return (
    <div className="flex-1 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight ">Add Product</h2>
        <BackButton section="products" />
      </div>
      <ProductForm brands={brands} categories={categories} />
    </div>
  )
}
