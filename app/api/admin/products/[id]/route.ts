import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Product, Brand, Category, Variation } from "@/lib/models"
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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    await connectToDatabase()

    const product = await Product.findById(id).populate("brand_id", "name").populate("category_id", "name").lean()

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
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

    // Check if product exists
    const product = await Product.findById(id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Validate brand and category existence
    if (!isValidObjectId(validatedData.brand_id)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 })
    }

    if (!isValidObjectId(validatedData.category_id)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 })
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

    // Generate slug if name changed
    let slug = product.slug
    if (product.name !== validatedData.name) {
      slug = slugify(validatedData.name, { lower: true })

      // Check if slug already exists
      const slugExists = await Product.findOne({
        slug,
        _id: { $ne: id },
      })

      if (slugExists) {
        // Append a random string to make the slug unique
        slug = `${slug}-${Math.random().toString(36).substring(2, 8)}`
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: validatedData.name,
        description: validatedData.description,
        brand_id: validatedData.brand_id,
        category_id: validatedData.category_id,
        material: validatedData.material,
        tags: validatedData.tags,
        is_featured: validatedData.is_featured,
        is_best_seller: validatedData.is_best_seller,
        slug,
      },
      { new: true },
    )
      .populate("brand_id", "name")
      .populate("category_id", "name")
      .lean()

    return NextResponse.json({
      product: updatedProduct,
      message: "Product updated successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if product exists
    const product = await Product.findById(id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Delete all variations associated with this product
    if (product.variations && product.variations.length > 0) {
      await Variation.deleteMany({ _id: { $in: product.variations } })
    }

    // Delete product
    await Product.findByIdAndDelete(id)

    return NextResponse.json({
      message: "Product and its variations deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
