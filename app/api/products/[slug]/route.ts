import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Product } from "@/lib/models"

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase()

    const { slug } = await params

    // Find the product by slug and populate related data
    const product: any = await Product.findOne({ slug })
      .populate("brand_id")
      .populate("category_id")
      .populate("variations")
      .lean()

    if (!product) {
      console.error(`Product not found for slug: ${slug}`)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Format response to handle ObjectId conversion
    const formattedProduct = {
      ...product,
      _id: product._id.toString(),
      brand_id: product.brand_id
        ? {
            ...product.brand_id,
            _id: product.brand_id._id.toString(),
          }
        : null,
      category_id: product.category_id
        ? {
            ...product.category_id,
            _id: product.category_id._id.toString(),
            parent_category_id: product.category_id.parent_category_id
              ? product.category_id.parent_category_id.toString()
              : null,
          }
        : null,
      variations: Array.isArray(product.variations)
        ? product.variations.map((variation: any) => ({
            ...variation,
            _id: variation._id.toString(),
            product_id: variation.product_id.toString(),
          }))
        : [],
    }

    return NextResponse.json(formattedProduct)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase()

    const { slug } = await params
    const body = await request.json()

    // Find the product by slug first
    const existingProduct = await Product.findOne({ slug })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Validate the request body for status updates
    const allowedFields = ["is_featured", "is_best_seller"]
    const updateData: any = {}

    // Only allow updating specific status fields
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    // Update the product
    const updatedProduct : any = await Product.findOneAndUpdate(
      { slug },
      { $set: updateData },
      { new: true, runValidators: true },
    )
      .populate("brand_id")
      .populate("category_id")
      .lean()

    if (!updatedProduct) {
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
    }

    // Format response to handle ObjectId conversion
    const formattedProduct = {
      ...updatedProduct,
      _id: updatedProduct._id.toString(),
      brand_id: updatedProduct.brand_id
        ? {
            ...updatedProduct.brand_id,
            _id: updatedProduct.brand_id._id.toString(),
          }
        : null,
      category_id: updatedProduct.category_id
        ? {
            ...updatedProduct.category_id,
            _id: updatedProduct.category_id._id.toString(),
            parent_category_id: updatedProduct.category_id.parent_category_id
              ? updatedProduct.category_id.parent_category_id.toString()
              : null,
          }
        : null,
    }

    return NextResponse.json(formattedProduct)
  } catch (error) {
    console.error("Error updating product status:", error)
    return NextResponse.json({ error: "Failed to update product status" }, { status: 500 })
  }
}
