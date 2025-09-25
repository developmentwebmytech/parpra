import type { Metadata } from "next"
import { getCategories } from "@/lib/data"
import { CategoriesTable } from "@/components/categories/categories-table"
import { CategoriesFilter } from "@/components/categories/categories-filter"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Categories | E-commerce Admin",
  description: "Manage your store categories",
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; per_page?: string; name?: string; parent_id?: string }>
}) {
  // Await the searchParams promise
  const searchParamsObj = await searchParams
  const searchParam = searchParamsObj || {}
  const page = Number(searchParam.page) || 1
  const per_page = Number(searchParam.per_page) || 10
  const name = searchParam.name || ""
  const parent_id = searchParam.parent_id || ""

  const { categories, totalPages } = await getCategories({
    page,
    per_page,
    name,
    parent_id,
  })

  // Get all categories for the parent filter dropdown
  const { categories: allCategories } = await getCategories({
    page: 1,
    per_page: 100,
  })

  return (
    <div className="flex-1 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-4xl font-bold tracking-tight">Categories</h2>
        <Button asChild  className=" bg-teal-600 text-white   hover:bg-teal-500 hover:text-white transition">
          <Link href="/dashboard/categories/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      <CategoriesFilter parentCategories={allCategories} />

      <CategoriesTable categories={categories} totalPages={totalPages} page={page} per_page={per_page} />
    </div>
  )
}
