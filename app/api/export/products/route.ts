import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Product, Variation } from "@/lib/models"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as XLSX from "xlsx"
import Papa from "papaparse"



export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const fileType = searchParams.get("fileType") || "json"

    await connectToDatabase()

    // Fetch all products with their brands and categories
    const products = await Product.find({}).populate("brand_id", "name").populate("category_id", "name").lean()

    // For JSON format, we can keep the nested structure
    if (fileType === "json") {
      const productsWithVariations = await Promise.all(
        products.map(async (product: any) => {
          const variations: any = await Variation.find({ product_id: product._id }).lean()

          return {
            id: product._id.toString(),
            name: product.name,
            description: product.description,
            brand_id: product.brand_id._id.toString(),
            brand_name: product.brand_id.name,
            category_id: product.category_id._id.toString(),
            category_name: product.category_id.name,
            material: product.material || "",
            tags: product.tags || [],
            is_featured: product.is_featured,
            is_best_seller: product.is_best_seller,
            slug: product.slug,
            variations: variations.map((variation: any) => ({
              id: variation._id.toString(),
              size: variation.size,
              color: variation.color,
              price: variation.price,
              salePrice: variation.salePrice,
              sku: variation.sku,
              quantity: variation.quantity,
              image: variation.image || "",
              gallery: variation.gallery || [],
            })),
          }
        }),
      )

      return new Response(JSON.stringify(productsWithVariations, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": "attachment; filename=products.json",
        },
      })
    }
    // For Excel and CSV, we need to flatten the structure
    else {
      // Create a flattened array where each variation becomes a row with product details
      const flattenedData: any[] = []

      await Promise.all(
        products.map(async (product: any) => {
          const variations = await Variation.find({ product_id: product._id }).lean()

          // If no variations, add the product as a single row
          if (variations.length === 0) {
            flattenedData.push({
              product_id: product._id.toString(),
              product_name: product.name,
              product_description: product.description,
              brand_id: product.brand_id._id.toString(),
              brand_name: product.brand_id.name,
              category_id: product.category_id._id.toString(),
              category_name: product.category_id.name,
              material: product.material || "",
              tags: product.tags ? product.tags.join(", ") : "",
              is_featured: product.is_featured ? "Yes" : "No",
              is_best_seller: product.is_best_seller ? "Yes" : "No",
              slug: product.slug,
              variation_id: "",
              size: "",
              color: "",
              price: "",
              salePrice: "",
              sku: "",
              quantity: "",
              image: "",
              gallery: "",
            })
          } else {
            // Add each variation as a separate row with product details
            variations.forEach((variation: any) => {
              flattenedData.push({
                product_id: product._id.toString(),
                product_name: product.name,
                product_description: product.description,
                brand_id: product.brand_id._id.toString(),
                brand_name: product.brand_id.name,
                category_id: product.category_id._id.toString(),
                category_name: product.category_id.name,
                material: product.material || "",
                tags: product.tags ? product.tags.join(", ") : "",
                is_featured: product.is_featured ? "Yes" : "No",
                is_best_seller: product.is_best_seller ? "Yes" : "No",
                slug: product.slug,
                variation_id: variation._id.toString(),
                size: variation.size || "",
                color: variation.color || "",
                price: variation.price || "",
                salePrice: variation.salePrice || "",
                sku: variation.sku || "",
                quantity: variation.quantity || "",
                image: variation.image || "",
                gallery: variation.gallery ? variation.gallery.join(", ") : "",
              })
            })
          }
        }),
      )

      if (fileType === "excel") {
        const worksheet = XLSX.utils.json_to_sheet(flattenedData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Products")

        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

        return new Response(buffer, {
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": "attachment; filename=products.xlsx",
          },
        })
      } else if (fileType === "csv") {
        const csv = Papa.unparse(flattenedData, { header: true })

        return new Response(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=products.csv",
          },
        })
      }
    }

    // Default response if something goes wrong with format selection
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
  } catch (error) {
    console.error("Error exporting products:", error)
    return NextResponse.json({ error: "Failed to export products" }, { status: 500 })
  }
}
