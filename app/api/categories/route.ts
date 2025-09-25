import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Category } from "@/lib/models"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { saveImageToPublic } from "@/lib/image-upload"
import { isValidObjectId } from "mongoose"

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  parent_category_id: z.string().nullable().optional(),
  image: z.string().optional().nullable(),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    await connectToDatabase()

    const [categories, totalCategories] = await Promise.all([
      Category.find({}).populate("parent_category_id", "name").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Category.countDocuments({}),
    ])

    const totalPages = Math.ceil(totalCategories / limit)

    return NextResponse.json({
      categories,
      meta: {
        totalCategories,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const name = formData.get("name") as string
    const parent_category_id = formData.get("parent_category_id") as string
    const imageFile = formData.get("image") as File | null

    // Validate input
    const validatedData = categorySchema.parse({
      name,
      parent_category_id: parent_category_id || null,
      image: imageFile ? "placeholder" : null, // Just for validation
    })

    await connectToDatabase()

    // Check if category already exists
    const existingCategory = await Category.findOne({ name })

    if (existingCategory) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 409 })
    }

    // Validate parent category if provided
    if (validatedData.parent_category_id && isValidObjectId(validatedData.parent_category_id)) {
      const parentCategory = await Category.findById(validatedData.parent_category_id)

      if (!parentCategory) {
        return NextResponse.json({ error: "Parent category not found" }, { status: 404 })
      }
    }

    // Handle image upload if provided
    let imagePath = null
    if (imageFile) {
      imagePath = await saveImageToPublic(imageFile, "categories")
    }

    // Create new category
    const category = await Category.create({
      name: validatedData.name,
      parent_category_id:
        validatedData.parent_category_id && isValidObjectId(validatedData.parent_category_id)
          ? validatedData.parent_category_id
          : null,
      image: imagePath,
    })

    return NextResponse.json({ category, message: "Category created successfully" }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
