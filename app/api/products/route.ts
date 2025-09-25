import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Product } from "@/lib/models"

export async function GET(request: Request) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const featured = searchParams.get("featured") === "true"
    const bestSeller = searchParams.get("bestSeller") === "true"
    const categoryId = searchParams.get("categoryId")
    const brandId = searchParams.get("brandId")
    const search = searchParams.get("search")
    const minPrice = searchParams.get("minPrice") ? Number.parseInt(searchParams.get("minPrice")!) : undefined
    const maxPrice = searchParams.get("maxPrice") ? Number.parseInt(searchParams.get("maxPrice")!) : undefined
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    // Build query
    const query: any = {}

    if (featured) query.is_featured = true
    if (bestSeller) query.is_best_seller = true
    if (categoryId) query.category_id = categoryId
    if (brandId) query.brand_id = brandId

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    // Price filter requires joining with variations
    let priceFilter: any = {}
    if (minPrice !== undefined || maxPrice !== undefined) {
      priceFilter = {
        $and: [],
      }

      if (minPrice !== undefined) {
        priceFilter.$and.push({ "variations.price": { $gte: minPrice } })
      }

      if (maxPrice !== undefined) {
        priceFilter.$and.push({ "variations.price": { $lte: maxPrice } })
      }
    }

    // Count total documents for pagination
    const total = await Product.countDocuments(query)

    // Execute query with pagination
    const skip = (page - 1) * limit

    // Sort options
    const sortOptions: any = {}
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1

    // Fetch products with populated fields
    const products = await Product.find(query)
      .populate("brand_id")
      .populate("category_id")
      .populate("variations")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean()

    // Calculate total pages
    const totalPages = Math.ceil(total / limit)

    // Format response
    const formattedProducts = products.map((product: any) => ({
      ...product,
      _id: product._id.toString(),
      brand_id: {
        ...product.brand_id,
        _id: product.brand_id._id.toString(),
      },
      category_id: {
        ...product.category_id,
        _id: product.category_id._id.toString(),
        parent_category_id: product.category_id.parent_category_id
          ? product.category_id.parent_category_id.toString()
          : null,
      },
      variations: product.variations.map((variation: any) => ({
        ...variation,
        _id: variation._id.toString(),
        product_id: variation.product_id.toString(),
      })),
    }))

    return NextResponse.json({
      products: formattedProducts,
      total,
      page,
      limit,
      totalPages,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
