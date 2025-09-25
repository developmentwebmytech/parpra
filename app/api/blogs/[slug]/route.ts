import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import {Blog} from "@/lib/models/blog"

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectToDatabase()

    const {slug} = await params

    // Find the blog by slug
    const blog: any = await Blog.findOne({ slug }).lean()

  

    if (!blog) {
    
      return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    }

    // Get related blogs (by category or tag)
    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      $or: [{ categories: { $in: blog.categories || [] } }, { tags: { $in: blog.tags || [] } }],
    })
      .sort({ publish_date: -1, created_at: -1 })
      .limit(3)
      .lean()



    return NextResponse.json({
      blog: {
        ...blog,
        _id: blog._id.toString(),
        publish_date: blog.publish_date || blog.created_at,
      },
      relatedBlogs: relatedBlogs.map((relatedBlog: any) => ({
        ...relatedBlog,
        _id: relatedBlog._id.toString(),
        publish_date: relatedBlog.publish_date || relatedBlog.created_at,
      })),
    })
  } catch (error) {
    console.error("Error fetching blog:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch blog",
        details: (error as Error).message
      },
      { status: 500 },
    )
  }
}
