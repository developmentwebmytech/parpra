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
  tax_rate: z
    .number()
    .refine((val) => [0, 5, 12, 18, 28].includes(val), {
      message: "Tax rate must be one of: 0, 5, 12, 18, 28",
    })
    .optional(),
  is_new_arrival: z.boolean().optional(),
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
    console.log("[v0] POST /api/products called")

    const session = await getServerSession(authOptions)

    if (!session) {
      console.log("[v0] No session found, returning 401")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body
    try {
      const contentLength = req.headers.get("content-length")
      console.log("[v0] Content-Length:", contentLength)

      if (!contentLength || contentLength === "0") {
        console.log("[v0] No content-length or empty body")
        return NextResponse.json({ error: "Request body is required" }, { status: 400 })
      }

      const contentType = req.headers.get("content-type")
      console.log("[v0] Content-Type:", contentType)

      if (!contentType || !contentType.includes("application/json")) {
        console.log("[v0] Invalid content-type")
        return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 400 })
      }

      body = await req.json()
      console.log("[v0] Request body parsed:", body)
    } catch (jsonError) {
      console.error("[v0] JSON parsing error:", jsonError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const {
      name,
      description,
      brand_id,
      category_id,
      material,
      tags,
      is_featured,
      is_best_seller,
      tax_rate,
      is_new_arrival,
    } = body

    console.log("[v0] Extracted data:", { name, brand_id, category_id, tax_rate })

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
      tax_rate: tax_rate || 0,
      is_new_arrival: is_new_arrival || false,
    })

    console.log("[v0] Data validated successfully")

    await connectToDatabase()
    console.log("[v0] Connected to database")

    // Validate brand and category existence
    if (!isValidObjectId(validatedData.brand_id)) {
      console.log("[v0] Invalid brand ID:", validatedData.brand_id)
      return NextResponse.json({ error: "Invalid brand ID " }, { status: 400 })
    }

    if (!isValidObjectId(validatedData.category_id)) {
      console.log("[v0] Invalid category ID:", validatedData.category_id)
      return NextResponse.json({ error: "Invalid category ID " }, { status: 400 })
    }

    const [brand, category] = await Promise.all([
      Brand.findById(validatedData.brand_id),
      Category.findById(validatedData.category_id),
    ])

    console.log("[v0] Brand found:", !!brand, "Category found:", !!category)

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

    console.log("[v0] Generated slug:", slug)

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
      tax_rate: validatedData.tax_rate,
      is_new_arrival: validatedData.is_new_arrival,
      slug,
      variations: [],
    })

    console.log("[v0] Product created successfully:", product._id)

    return NextResponse.json({ product, message: "Product created successfully" }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[v0] Validation error:", error.errors)
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("[v0] Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
