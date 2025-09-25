import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Variation, Product } from "@/lib/models"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { saveImageToPublic, deleteImageFromPublic } from "@/lib/image-upload"
import { isValidObjectId } from "mongoose"

const variationSchema = z.object({
  size: z.enum(["XS", "S", "M", "L", "XL", "XXL"], {
    errorMap: () => ({ message: "Invalid size" }),
  }),
  color: z.string().min(1, "Color is required"),
  price: z.number().min(0, "Price must be a positive number"),
  salePrice: z.number().optional().nullable(),
  sku: z.string().min(1, "SKU is required"),
  quantity: z.number().min(0, "Quantity must be a positive number"),
})

export async function GET(req: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
   const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid variation ID" }, { status: 400 })
    }

    await connectToDatabase()

    const variation = await Variation.findById(id).populate("product_id", "name").lean()

    if (!variation) {
      return NextResponse.json({ error: "Variation not found" }, { status: 404 })
    }

    return NextResponse.json({ variation })
  } catch (error) {
    console.error("Error fetching variation:", error)
    return NextResponse.json({ error: "Failed to fetch variation" }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid variation ID" }, { status: 400 })
    }

    const formData = await req.formData()
    const size = formData.get("size") as string
    const color = formData.get("color") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const salePrice = formData.get("salePrice") ? Number.parseFloat(formData.get("salePrice") as string) : null
    const sku = formData.get("sku") as string
    const quantity = Number.parseInt(formData.get("quantity") as string)
    const imageFile = formData.get("image") as File | null
    const galleryFiles = formData.getAll("gallery") as File[]
    const keepExistingImage = formData.get("keepExistingImage") === "true"
    const keepExistingGallery = formData.get("keepExistingGallery") === "true"

    // Validate input
    const validatedData = variationSchema.parse({
      size,
      color,
      price,
      salePrice,
      sku,
      quantity,
    })

    await connectToDatabase()

    // Check if variation exists
    const variation = await Variation.findById(id)

    if (!variation) {
      return NextResponse.json({ error: "Variation not found" }, { status: 404 })
    }

    // Check if SKU already exists (but not for this variation)
    const existingSku = await Variation.findOne({
      sku: validatedData.sku,
      _id: { $ne: id },
    })

    if (existingSku) {
      return NextResponse.json({ error: "SKU already exists" }, { status: 409 })
    }

    // Handle image upload if provided
    let imagePath = variation.image

    if (!keepExistingImage && variation.image) {
      await deleteImageFromPublic(variation.image)
      imagePath = null
    }

    if (imageFile) {
      imagePath = await saveImageToPublic(imageFile, "variations")
    }

    // Handle gallery uploads
    let galleryPaths = variation.gallery || []

    if (!keepExistingGallery && galleryPaths.length > 0) {
      for (const path of galleryPaths) {
        await deleteImageFromPublic(path)
      }
      galleryPaths = []
    }

    for (const file of galleryFiles) {
      const path = await saveImageToPublic(file, "variations/gallery")
      galleryPaths.push(path)
    }

    // Update variation
    const updatedVariation = await Variation.findByIdAndUpdate(
      id,
      {
        size: validatedData.size,
        color: validatedData.color,
        price: validatedData.price,
        salePrice: validatedData.salePrice,
        sku: validatedData.sku,
        quantity: validatedData.quantity,
        image: imagePath,
        gallery: galleryPaths,
      },
      { new: true },
    )
      .populate("product_id", "name")
      .lean()

    return NextResponse.json({
      variation: updatedVariation,
      message: "Variation updated successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating variation:", error)
    return NextResponse.json({ error: "Failed to update variation" }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid variation ID" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if variation exists
    const variation = await Variation.findById(id)

    if (!variation) {
      return NextResponse.json({ error: "Variation not found" }, { status: 404 })
    }

    // Remove variation from product
    await Product.findByIdAndUpdate(variation.product_id, { $pull: { variations: id } })

    // Delete image if exists
    if (variation.image) {
      await deleteImageFromPublic(variation.image)
    }

    // Delete gallery images if exist
    if (variation.gallery && variation.gallery.length > 0) {
      for (const path of variation.gallery) {
        await deleteImageFromPublic(path)
      }
    }

    // Delete variation
    await Variation.findByIdAndDelete(id)

    return NextResponse.json({
      message: "Variation deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting variation:", error)
    return NextResponse.json({ error: "Failed to delete variation" }, { status: 500 })
  }
}
