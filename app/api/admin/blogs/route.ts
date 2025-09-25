import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Blog } from "@/lib/models/blog"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const skip = (page - 1) * limit

    const [blogs, total] = await Promise.all([
      Blog.find({}).sort({ created_at: -1 }).skip(skip).limit(limit).lean(),
      Blog.countDocuments({}),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      blogs: blogs.map((blog: any) => ({
        ...blog,
        _id: blog._id.toString(),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}

export async function POST(request: Request) {

  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "admin") {
      console.error("❌ Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

   

    // Connect to database
    try {
      await connectToDatabase()
      
    } catch (dbError) {
      console.error("❌ Database connection error:", dbError)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: dbError instanceof Error ? dbError.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    // Parse request body
    let data
    try {
      data = await request.json()
     
      
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parseError instanceof Error ? parseError.message : "Unknown error",
        },
        { status: 400 },
      )
    }

    // Validate required fields
    const requiredFields = ["title", "slug", "content", "excerpt", "featured_image", "author"]
    const missingFields = []

    for (const field of requiredFields) {
      if (!data[field]) {
        missingFields.push(field)
      }
    }

    if (missingFields.length > 0) {
      console.error(`❌ Missing required fields: ${missingFields.join(", ")}`)
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      )
    }

    

    // Check if slug already exists
    try {
      const existingBlog = await Blog.findOne({ slug: data.slug })
      if (existingBlog) {
        console.error(`❌ Slug already exists: ${data.slug}`)
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
      }
  
    } catch (slugCheckError) {
      console.error("❌ Error checking slug uniqueness:", slugCheckError)
      return NextResponse.json(
        {
          error: "Failed to check slug uniqueness",
          details: slugCheckError instanceof Error ? slugCheckError.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    // Create the blog with explicit data mapping
    try {
      const blogData = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        featured_image: data.featured_image,
        author: data.author,
        categories: Array.isArray(data.categories) ? data.categories : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        published: data.published !== undefined ? data.published : true,
        publish_date: data.publish_date || new Date(),
        meta_title: data.meta_title || "",
        meta_description: data.meta_description || "",
        created_at: new Date(),
        updated_at: new Date(),
      }

      const blog = new Blog(blogData)
      await blog.save()

      

      return NextResponse.json({
        message: "Blog created successfully",
        blog: {
          ...blog.toObject(),
          _id: blog._id.toString(),
        },
      })
    } catch (saveError) {
      console.error("❌ Error saving blog:", saveError)
      return NextResponse.json(
        {
          error: "Failed to save blog",
          details: saveError instanceof Error ? saveError.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Unhandled error in blog creation:", error)
    return NextResponse.json(
      {
        error: "Failed to create blog",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
