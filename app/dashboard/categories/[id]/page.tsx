import type { Metadata } from "next"
import { getCategoryById, getCategories } from "@/lib/data"
import { CategoryForm } from "@/components/categories/category-form"
import { BackButton } from "@/components/back-button"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Edit Category | E-commerce Admin",
  description: "Edit a category in your store",
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Await the params promise
  const param = await params
  const [category, { categories }] = await Promise.all([
    getCategoryById(param.id),
    getCategories({ page: 1, per_page: 100 }),
  ])

  if (!category) {
    notFound()
  }

  // Filter out the current category and its children to prevent circular references
  const filteredCategories = categories.filter((c: any) => c._id.toString() !== param.id)

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Edit Category</h2>
        <BackButton section="categories" />
      </div>
      <CategoryForm category={category} parentCategories={filteredCategories} />
    </div>
  )
}
