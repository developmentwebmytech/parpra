import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Category } from "@/lib/models"

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase()

    // Convert slug to a potential category name
    const {slug} = await params

    // Try multiple approaches to find the category
    let category: any = null

    // 1. Try direct match with the slug (for categories that might have been added with slugs)
    category = await Category.findOne({ slug }).lean()

    if (!category) {
      // 2. Try to find by converting slug to a name format
      const possibleName = slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

      category = await Category.findOne({
        name: { $regex: new RegExp(`^${possibleName}$`, "i") },
      }).lean()
    }

    if (!category) {
      // 3. Try a more flexible approach for special cases like "CO-ORD SET"
      // Replace hyphens with spaces and try case-insensitive search
      const alternativeName = slug.replace(/-/g, " ").toUpperCase()
      category = await Category.findOne({
        name: { $regex: new RegExp(`^${alternativeName}$`, "i") },
      }).lean()
    }

    if (!category) {
      // 4. Last resort: try a partial match
      const partialMatch = slug.replace(/-/g, "")
      category = await Category.findOne({
        name: { $regex: new RegExp(partialMatch, "i") },
      }).lean()
    }

    if (!category) {
      // Log the attempted slug for debugging
      console.error(`Category not found for slug: ${slug}`)
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...category,
      _id: category._id.toString(),
      parent_category_id: category.parent_category_id ? category.parent_category_id.toString() : null,
    })
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}
