import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Variation, Product } from "@/lib/models"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { saveImageToPublic } from "@/lib/image-upload"
import { isValidObjectId } from "mongoose"

const variationSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  size: z.enum(["XS", "S", "M", "L", "XL", "XXL"], {
    errorMap: () => ({ message: "Invalid size" }),
  }),
  color: z.string().min(1, "Color is required"),
  price: z.number().min(0, "Price must be a positive number"),
  salePrice: z.number().optional().nullable(),
  sku: z.string().min(1, "SKU is required"),
  quantity: z.number().min(0, "Quantity must be a positive number"),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const productId = searchParams.get("product_id")
    const skip = (page - 1) * limit

    await connectToDatabase()

    let query = {}
    if (productId && isValidObjectId(productId)) {
      query = { product_id: productId }
    }

    const [variations, totalVariations] = await Promise.all([
      Variation.find(query).populate("product_id", "name").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Variation.countDocuments(query),
    ])

    const totalPages = Math.ceil(totalVariations / limit)

    return NextResponse.json({
      variations,
      meta: {
        totalVariations,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    })
  } catch (error) {
    console.error("Error fetching variations:", error)
    return NextResponse.json({ error: "Failed to fetch variations" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const product_id = formData.get("product_id") as string
    const size = formData.get("size") as string
    const color = formData.get("color") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const salePrice = formData.get("salePrice") ? Number.parseFloat(formData.get("salePrice") as string) : null
    const sku = formData.get("sku") as string
    const quantity = Number.parseInt(formData.get("quantity") as string)
    const imageFile = formData.get("image") as File | null
    const galleryFiles = formData.getAll("gallery") as File[]

    // Validate input
    const validatedData = variationSchema.parse({
      product_id,
      size,
      color,
      price,
      salePrice,
      sku,
      quantity,
    })

    await connectToDatabase()

    // Check if product exists
    if (!isValidObjectId(validatedData.product_id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const product = await Product.findById(validatedData.product_id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if SKU already exists
    const existingSku = await Variation.findOne({ sku: validatedData.sku })

    if (existingSku) {
      return NextResponse.json({ error: "SKU already exists" }, { status: 409 })
    }

    // Handle image upload if provided
    let imagePath = null
    if (imageFile) {
      imagePath = await saveImageToPublic(imageFile, "variations")
    }

    // Handle gallery uploads if provided
    const galleryPaths = []
    for (const file of galleryFiles) {
      const path = await saveImageToPublic(file, "variations/gallery")
      galleryPaths.push(path)
    }

    // Create new variation
    const variation = await Variation.create({
      product_id: validatedData.product_id,
      size: validatedData.size,
      color: validatedData.color,
      price: validatedData.price,
      salePrice: validatedData.salePrice,
      sku: validatedData.sku,
      quantity: validatedData.quantity,
      image: imagePath,
      gallery: galleryPaths,
    })

    // Add variation to product
    await Product.findByIdAndUpdate(validatedData.product_id, { $push: { variations: variation._id } })

    return NextResponse.json({ variation, message: "Variation created successfully" }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error creating variation:", error)
    return NextResponse.json({ error: "Failed to create variation" }, { status: 500 })
  }
}
