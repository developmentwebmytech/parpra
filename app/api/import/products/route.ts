import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Product, Brand, Category, Variation } from "@/lib/models"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as XLSX from "xlsx"
import { parse } from "papaparse"
import slugify from "slugify"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const fileType = formData.get("fileType") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    await connectToDatabase()

    const buffer = await file.arrayBuffer()
    let products = []

    // Parse file based on type
    if (fileType === "excel") {
      const workbook = XLSX.read(buffer)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      products = XLSX.utils.sheet_to_json(worksheet)
    } else if (fileType === "csv") {
      const text = new TextDecoder().decode(buffer)
      const result = parse(text, { header: true, skipEmptyLines: true })
      products = result.data
    } else if (fileType === "json") {
      const text = new TextDecoder().decode(buffer)
      products = JSON.parse(text)
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "No valid products found in file" }, { status: 400 })
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Process each product
    for (const productData of products) {
      try {
        // Validate required fields
        if (!productData.name || !productData.description || !productData.brand_name || !productData.category_name) {
          results.errors.push(`Missing required fields for product: ${productData.name || "Unknown"}`)
          results.failed++
          continue
        }

        // Find or create brand
        let brand = await Brand.findOne({ name: productData.brand_name })
        if (!brand) {
          brand = await Brand.create({ name: productData.brand_name })
        }

        // Find or create category
        let category = await Category.findOne({ name: productData.category_name })
        if (!category) {
          category = await Category.create({ name: productData.category_name })
        }

        // Generate slug
        let slug = slugify(productData.name, { lower: true })
        const slugExists = await Product.findOne({ slug })
        if (slugExists) {
          slug = `${slug}-${Math.random().toString(36).substring(2, 8)}`
        }

        // Create product
        const product = await Product.create({
          name: productData.name,
          description: productData.description,
          brand_id: brand._id,
          category_id: category._id,
          material: productData.material || "",
          tags: productData.tags ? productData.tags.split(",").map((tag: string) => tag.trim()) : [],
          is_featured: productData.is_featured === "true" || productData.is_featured === true,
          is_best_seller: productData.is_best_seller === "true" || productData.is_best_seller === true,
          slug,
          variations: [],
        })

        // Process variations if they exist
        if (productData.variations && Array.isArray(productData.variations)) {
          for (const variationData of productData.variations) {
            try {
              if (!variationData.size || !variationData.color || !variationData.price || !variationData.sku) {
                results.errors.push(`Missing required fields for variation of product: ${product.name}`)
                continue
              }

              const variation = await Variation.create({
                product_id: product._id,
                size: variationData.size,
                color: variationData.color,
                price: Number(variationData.price),
                salePrice: variationData.salePrice ? Number(variationData.salePrice) : null,
                sku: variationData.sku,
                quantity: Number(variationData.quantity) || 0,
                image: variationData.image || null,
                gallery: variationData.gallery ? variationData.gallery.split(",").map((url: string) => url.trim()) : [],
              })

              // Add variation to product
              await Product.findByIdAndUpdate(product._id, { $push: { variations: variation._id } })
            } catch (error: any) {
              results.errors.push(`Error creating variation for product ${product.name}: ${error.message}`)
            }
          }
        }

        results.success++
      } catch (error: any) {
        results.errors.push(`Error creating product ${productData.name || "Unknown"}: ${error.message}`)
        results.failed++
      }
    }

    return NextResponse.json({
      message: `Import completed. ${results.success} products imported successfully, ${results.failed} failed.`,
      results,
    })
  } catch (error) {
    console.error("Error importing products:", error)
    return NextResponse.json({ error: "Failed to import products" }, { status: 500 })
  }
}
