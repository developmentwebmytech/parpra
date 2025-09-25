import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import {Blog} from "@/lib/models/blog"

export async function GET() {
  try {

    await connectToDatabase()

    // Get all blogs to extract categories and tags
    const blogs = await Blog.find({}, { categories: 1, tags: 1, title: 1 }).lean()

   

    // Extract unique categories and tags
    const categoriesSet = new Set<string>()
    const tagsSet = new Set<string>()

    blogs.forEach((blog: any) => {
      

      // Handle categories
      if (blog.categories) {
        if (Array.isArray(blog.categories)) {
          blog.categories.forEach((cat: string) => {
            if (cat && typeof cat === "string" && cat.trim()) {
              categoriesSet.add(cat.trim())
            }
          })
        } else if (typeof blog.categories === "string" && blog.categories.trim()) {
          // Handle comma-separated string
          blog.categories.split(",").forEach((cat: string) => {
            if (cat && cat.trim()) {
              categoriesSet.add(cat.trim())
            }
          })
        }
      }

      // Handle tags
      if (blog.tags) {
        if (Array.isArray(blog.tags)) {
          blog.tags.forEach((tag: string) => {
            if (tag && typeof tag === "string" && tag.trim()) {
              tagsSet.add(tag.trim())
            }
          })
        } else if (typeof blog.tags === "string" && blog.tags.trim()) {
          // Handle comma-separated string
          blog.tags.split(",").forEach((tag: string) => {
            if (tag && tag.trim()) {
              tagsSet.add(tag.trim())
            }
          })
        }
      }
    })

    const categories = Array.from(categoriesSet).sort()
    const tags = Array.from(tagsSet).sort()

  

    return NextResponse.json({
      categories,
      tags,
      debug: {
        totalBlogs: blogs.length,
        categoriesFound: categories.length,
        tagsFound: tags.length,
      },
    })
  } catch (error) {
    console.error("Error fetching categories and tags:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch categories and tags",
        categories: [],
        tags: [],
      },
      { status: 500 },
    )
  }
}
