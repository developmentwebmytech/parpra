import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Brand } from "@/lib/models"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { saveImageToPublic } from "@/lib/image-upload"

const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  image: z.string().optional().nullable(),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    await connectToDatabase()

    const [brands, totalBrands] = await Promise.all([
      Brand.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Brand.countDocuments({}),
    ])

    const totalPages = Math.ceil(totalBrands / limit)

    return NextResponse.json({
      brands,
      meta: {
        totalBrands,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    })
  } catch (error) {
    console.error("Error fetching brands:", error)
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 })
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
    const imageFile = formData.get("image") as File | null

    // Validate input
    const validatedData = brandSchema.parse({
      name,
      image: imageFile ? "placeholder" : null, // Just for validation
    })

    await connectToDatabase()

    // Check if brand already exists
    const existingBrand = await Brand.findOne({ name })

    if (existingBrand) {
      return NextResponse.json({ error: "Brand with this name already exists" }, { status: 409 })
    }

    // Handle image upload if provided
    let imagePath = null
    if (imageFile) {
      imagePath = await saveImageToPublic(imageFile, "brands")
    }

    // Create new brand
    const brand = await Brand.create({
      name: validatedData.name,
      image: imagePath,
    })

    return NextResponse.json({ brand, message: "Brand created successfully" }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error creating brand:", error)
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 })
  }
}
