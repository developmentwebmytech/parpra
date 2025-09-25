import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Category, Product } from "@/lib/models"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { saveImageToPublic, deleteImageFromPublic } from "@/lib/image-upload"
import { isValidObjectId } from "mongoose"

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  parent_category_id: z.string().nullable().optional(),
  image: z.string().optional().nullable(),
})

export async function GET(req: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
   const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 })
    }

    await connectToDatabase()

    const category = await Category.findById(id).populate("parent_category_id", "name").lean()

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

   const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 })
    }

    const formData = await req.formData()
    const name = formData.get("name") as string
    const parent_category_id = formData.get("parent_category_id") as string
    const imageFile = formData.get("image") as File | null
    const keepExistingImage = formData.get("keepExistingImage") === "true"

    // Validate input
    const validatedData = categorySchema.parse({
      name,
      parent_category_id: parent_category_id || null,
      image: "placeholder", // Just for validation
    })

    await connectToDatabase()

    // Check if category exists
    const category = await Category.findById(id)

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Check if name is already taken by another category
    const existingCategory = await Category.findOne({
      name: validatedData.name,
      _id: { $ne: id },
    })

    if (existingCategory) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 409 })
    }

    // Prevent circular references in parent categories
    if (validatedData.parent_category_id && isValidObjectId(validatedData.parent_category_id)) {
      // Can't set itself as parent
      if (validatedData.parent_category_id === id) {
        return NextResponse.json({ error: "Category cannot be its own parent" }, { status: 400 })
      }

      // Check if parent exists
      const parentCategory = await Category.findById(validatedData.parent_category_id)

      if (!parentCategory) {
        return NextResponse.json({ error: "Parent category not found" }, { status: 404 })
      }

      // Check for circular references
      let currentParent = parentCategory
      while (currentParent.parent_category_id) {
        if (currentParent.parent_category_id.toString() === id) {
          return NextResponse.json({ error: "Circular reference detected in category hierarchy" }, { status: 400 })
        }
        currentParent = await Category.findById(currentParent.parent_category_id)
        if (!currentParent) break
      }
    }

    // Handle image upload if provided
    let imagePath = category.image

    if (!keepExistingImage && category.image) {
      await deleteImageFromPublic(category.image)
      imagePath = null
    }

    if (imageFile) {
      imagePath = await saveImageToPublic(imageFile, "categories")
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: validatedData.name,
        parent_category_id:
          validatedData.parent_category_id && isValidObjectId(validatedData.parent_category_id)
            ? validatedData.parent_category_id
            : null,
        image: imagePath,
      },
      { new: true },
    )
      .populate("parent_category_id", "name")
      .lean()

    return NextResponse.json({
      category: updatedCategory,
      message: "Category updated successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

   const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if category exists
    const category = await Category.findById(id)

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Check if category is used in any products
    const productsUsingCategory = await Product.countDocuments({ category_id: id })

    if (productsUsingCategory > 0) {
      return NextResponse.json({ error: "Cannot delete category as it is used in products" }, { status: 400 })
    }

    // Check if category is used as parent in other categories
    const childCategories = await Category.countDocuments({ parent_category_id: id })

    if (childCategories > 0) {
      return NextResponse.json(
        { error: "Cannot delete category as it is used as parent in other categories" },
        { status: 400 },
      )
    }

    // Delete image if exists
    if (category.image) {
      await deleteImageFromPublic(category.image)
    }

    // Delete category
    await Category.findByIdAndDelete(id)

    return NextResponse.json({
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
