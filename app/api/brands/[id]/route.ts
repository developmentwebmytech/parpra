import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Brand, Product } from "@/lib/models"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { saveImageToPublic, deleteImageFromPublic } from "@/lib/image-upload"
import { isValidObjectId } from "mongoose"

const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  image: z.string().optional().nullable(),
})

export async function GET(req: Request, { params }: { params: Promise<{ id: string }>}) {
  try {
   const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 })
    }

    await connectToDatabase()

    const brand = await Brand.findById(id).lean()

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    return NextResponse.json({ brand })
  } catch (error) {
    console.error("Error fetching brand:", error)
    return NextResponse.json({ error: "Failed to fetch brand" }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 })
    }

    const formData = await req.formData()
    const name = formData.get("name") as string
    const imageFile = formData.get("image") as File | null
    const keepExistingImage = formData.get("keepExistingImage") === "true"

    // Validate input
    const validatedData = brandSchema.parse({
      name,
      image: "placeholder", // Just for validation
    })

    await connectToDatabase()

    // Check if brand exists
    const brand = await Brand.findById(id)

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    // Check if name is already taken by another brand
    const existingBrand = await Brand.findOne({
      name: validatedData.name,
      _id: { $ne: id },
    })

    if (existingBrand) {
      return NextResponse.json({ error: "Brand with this name already exists" }, { status: 409 })
    }

    // Handle image upload if provided
    let imagePath = brand.image

    if (!keepExistingImage && brand.image) {
      await deleteImageFromPublic(brand.image)
      imagePath = null
    }

    if (imageFile) {
      imagePath = await saveImageToPublic(imageFile, "brands")
    }

    // Update brand
    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      {
        name: validatedData.name,
        image: imagePath,
      },
      { new: true },
    ).lean()

    return NextResponse.json({
      brand: updatedBrand,
      message: "Brand updated successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating brand:", error)
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid brand ID" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if brand exists
    const brand = await Brand.findById(id)

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    // Check if brand is used in any products
    const productsUsingBrand = await Product.countDocuments({ brand_id: id })

    if (productsUsingBrand > 0) {
      return NextResponse.json({ error: "Cannot delete brand as it is used in products" }, { status: 400 })
    }

    // Delete image if exists
    if (brand.image) {
      await deleteImageFromPublic(brand.image)
    }

    // Delete brand
    await Brand.findByIdAndDelete(id)

    return NextResponse.json({
      message: "Brand deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting brand:", error)
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 })
  }
}
