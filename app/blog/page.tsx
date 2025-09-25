import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Calendar, User, Tag, ArrowRight } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog - PARPRA",
  description: "Explore the latest trends, styling tips, and fashion insights in Indian ethnic wear.",
}

async function getBlogs() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const url = `${baseUrl}/api/blogs?limit=9`

    

    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    

    if (!res.ok) {
      const errorText = await res.text()
      console.error("API Error:", errorText)
      throw new Error(`Failed to fetch blogs: ${res.status}`)
    }

    const data = await res.json()
   

    return data
  } catch (error) {
    console.error("Error loading blogs:", error)
    return {
      blogs: [],
      pagination: { total: 0, page: 1, limit: 9, totalPages: 0 },
      error: (error as Error).message,
    }
  }
}

async function getCategoriesAndTags() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const url = `${baseUrl}/api/blogs/categories-tags`

   

    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      throw new Error("Failed to fetch categories and tags")
    }

    const data = await res.json()
    

    return data
  } catch (error) {
    console.error("Error loading categories and tags:", error)
    return { categories: [], tags: [], debug: null }
  }
}

function BlogFallback() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="h-60 bg-gray-200 animate-pulse"></div>
          <div className="p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function BlogPage() {
  const { blogs, pagination, error } = await getBlogs()
  const { categories, tags, debug } = await getCategoriesAndTags()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-light mb-4 text-amber-900">Our Blog</h1>
          <p className="text-amber-800 max-w-2xl mx-auto text-lg">
            Stay updated with the latest trends, styling tips, and fashion insights in the world of Indian ethnic wear.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm mb-12">
          <Link href="/" className="text-gray-500 hover:text-amber-700">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="text-gray-900">Blog</span>
        </div>

        {/* Debug Info (remove in production) */}
        {/* {process.env.NODE_ENV === "development" && (
          <div className="mb-4 p-4 bg-gray-100 rounded text-sm">
            <p>Debug Info:</p>
            <p>Blogs found: {blogs?.length || 0}</p>
            <p>Total in DB: {pagination?.total || 0}</p>
            <p>
              Categories: {categories?.length || 0} - {categories?.join(", ") || "None"}
            </p>
            <p>
              Tags: {tags?.length || 0} - {tags?.join(", ") || "None"}
            </p>
            {debug && (
              <p>
                Debug data: {debug.totalBlogs} blogs, {debug.categoriesFound} categories, {debug.tagsFound} tags
              </p>
            )}
            {error && <p className="text-red-600">Error: {error}</p>}
          </div>
        )} */}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="order-2 lg:order-1 lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20 border border-amber-100">
              <h2 className="text-xl font-medium mb-4 text-amber-900 border-b border-amber-100 pb-2">Categories</h2>
              <ul className="space-y-2 mb-8">
                {categories && categories.length > 0 ? (
                  categories.map((category: string) => (
                    <li key={category} className="group">
                      <Link
                        href={`/blog?category=${encodeURIComponent(category)}`}
                        className="text-gray-600 hover:text-amber-700 flex items-center group-hover:translate-x-1 transition-transform"
                      >
                        <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {/* {category} */}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">
                    No categories found
                    {process.env.NODE_ENV === "development" && (
                      <div className="text-xs mt-1">
                        <Link href="/api/blogs/categories-tags" className="text-blue-600 hover:underline">
                          Test API
                        </Link>
                      </div>
                    )}
                  </li>
                )}
              </ul>

              <h2 className="text-xl font-medium mb-4 text-amber-900 border-b border-amber-100 pb-2">Popular Tags</h2>
              <div className="flex flex-wrap gap-2">
                {tags && tags.length > 0 ? (
                  tags.map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className=" px-3 py-1 rounded-full text-sm text-amber-800 hover:bg-amber-100 hover:text-amber-900 transition-colors"
                    >
                      {/* {tag} */}
                    </Link>
                  ))
                ) : (
                  <span className="text-gray-500">No tags found</span>
                )}
              </div>
            </div>
          </div>

          {/* Blog Grid */}
          <div className="order-1 lg:order-2 lg:col-span-3">
            <Suspense fallback={<BlogFallback />}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs && blogs.length > 0 ? (
                  blogs.map((blog: any) => {
                    // Process categories and tags for display
                    const blogCategories = Array.isArray(blog.categories)
                      ? blog.categories
                      : typeof blog.categories === "string"
                        ? blog.categories.split(",").map((c: string) => c.trim())
                        : []

                    const blogTags = Array.isArray(blog.tags)
                      ? blog.tags
                      : typeof blog.tags === "string"
                        ? blog.tags.split(",").map((t: string) => t.trim())
                        : []

                    return (
                      <Link
                        key={blog._id}
                        href={`/blog/${blog.slug}`}
                        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group border border-amber-50"
                      >
                        <div className="relative h-60">
                          <Image
                            src={blog.featured_image || "/placeholder.svg?height=240&width=400&query=fashion blog"}
                            alt={blog.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Category Badge */}
                          {blogCategories.length > 0 && (
                            <div className="absolute top-4 left-4 bg-amber-700 text-white text-xs px-2 py-1 rounded">
                              {blogCategories[0]}
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>
                              {new Date(blog.publish_date || blog.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                            <span className="mx-2">•</span>
                            <User className="h-3 w-3 mr-1" />
                            <span>{blog.author}</span>
                          </div>
                          <h2 className="text-xl font-medium mb-2 group-hover:text-amber-700 transition-colors">
                            {blog.title}
                          </h2>
                          <p className="text-gray-600 line-clamp-3 mb-4 text-sm">{blog.excerpt}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-amber-700 text-sm font-medium group-hover:underline">Read more</span>
                            {/* Tags */}
                            {blogTags.length > 0 && (
                              <div className="flex items-center">
                                <Tag className="h-3 w-3 mr-1 text-gray-400" />
                                <span className="text-xs text-gray-500 truncate max-w-[100px]">
                                  {blogTags.slice(0, 2).join(", ")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <div className="col-span-full text-center py-12">
                    <h3 className="text-xl font-medium mb-2">No blog posts found</h3>
                    <p className="text-gray-600">{error ? `Error: ${error}` : "Check back soon for new content!"}</p>
                    {process.env.NODE_ENV === "development" && (
                      <div className="mt-4 text-sm text-gray-500">
                        <p>Debug: Check the console for more details</p>
                        <Link href="/api/blogs" className="text-blue-600 hover:underline">
                          Test API directly
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex space-x-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <Link
                        key={page}
                        href={`/blog?page=${page}`}
                        className={`px-4 py-2 rounded ${
                          page === pagination.page
                            ? "bg-amber-700 text-white"
                            : "bg-white text-gray-700 hover:bg-amber-50 border border-amber-100"
                        }`}
                      >
                        {page}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
