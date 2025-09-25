import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Product, Brand, Category } from "@/lib/models"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { isValidObjectId } from "mongoose"
import slugify from "slugify"

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  brand_id: z.string().min(1, "Brand is required"),
  category_id: z.string().min(1, "Category is required"),
  material: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
  is_best_seller: z.boolean().optional(),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    await connectToDatabase()

    const [products, totalProducts] = await Promise.all([
      Product.find({})
        .populate("brand_id", "name")
        .populate("category_id", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments({}),
    ])

    const totalPages = Math.ceil(totalProducts / limit)

    return NextResponse.json({
      products,
      meta: {
        totalProducts,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, brand_id, category_id, material, tags, is_featured, is_best_seller } = body

    // Validate input
    const validatedData = productSchema.parse({
      name,
      description,
      brand_id,
      category_id,
      material,
      tags: tags || [],
      is_featured: is_featured || false,
      is_best_seller: is_best_seller || false,
    })

    await connectToDatabase()

    // Validate brand and category existence
    if (!isValidObjectId(validatedData.brand_id)) {
      return NextResponse.json({ error: "Invalid brand ID " }, { status: 400 })
    }

    if (!isValidObjectId(validatedData.category_id)) {
      return NextResponse.json({ error: "Invalid category ID " }, { status: 400 })
    }

    const [brand, category] = await Promise.all([
      Brand.findById(validatedData.brand_id),
      Category.findById(validatedData.category_id),
    ])

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Generate slug
    let slug = slugify(validatedData.name, { lower: true })

    // Check if slug already exists
    const slugExists = await Product.findOne({ slug })

    if (slugExists) {
      // Append a random string to make the slug unique
      slug = `${slug}-${Math.random().toString(36).substring(2, 8)}`
    }

    // Create new product
    const product = await Product.create({
      name: validatedData.name,
      description: validatedData.description,
      brand_id: validatedData.brand_id,
      category_id: validatedData.category_id,
      material: validatedData.material,
      tags: validatedData.tags,
      is_featured: validatedData.is_featured,
      is_best_seller: validatedData.is_best_seller,
      slug,
      variations: [],
    })

    return NextResponse.json({ product, message: "Product created successfully" }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
