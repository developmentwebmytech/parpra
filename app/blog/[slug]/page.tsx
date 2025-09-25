import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ChevronRight, Calendar, User, Share2, Facebook, Twitter, Linkedin, Clock, ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/blogs/${slug}`, {
      cache: "no-store",
    })

    if (!res.ok) {
      return {
        title: "Blog Post - PARPRA",
        description: "Read our latest fashion insights and styling tips.",
      }
    }

    const { blog } = await res.json()

    return {
      title: blog.meta_title || `${blog.title} - PARPRA Blog`,
      description: blog.meta_description || blog.excerpt,
      openGraph: {
        images: [{ url: blog.featured_image }],
      },
    }
  } catch (error) {
    return {
      title: "Blog Post - PARPRA",
      description: "Read our latest fashion insights and styling tips.",
    }
  }
}

async function getBlogPost(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const url = `${baseUrl}/api/blogs/${slug}`

   
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    

    if (!res.ok) {
      if (res.status === 404) {
        
        return null
      }
      const errorText = await res.text()
      console.error("API Error:", errorText)
      throw new Error(`Failed to fetch blog: ${res.status}`)
    }

    const data = await res.json()
    
    return data
  } catch (error) {
    console.error(`Error fetching blog post with slug ${slug}:`, error)
    return null
  }
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params
 

  const data = await getBlogPost(slug)

  if (!data || !data.blog) {
    
    notFound()
  }

  const { blog, relatedBlogs } = data

  // Process categories and tags for display
  const blogCategories = Array.isArray(blog.categories)
    ? blog.categories
    : typeof blog.categories === "string"
      ? blog.categories
          .split(",")
          .map((c: string) => c.trim())
          .filter(Boolean)
      : []

  const blogTags = Array.isArray(blog.tags)
    ? blog.tags
    : typeof blog.tags === "string"
      ? blog.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean)
      : []

  // Calculate reading time (rough estimate)
  const wordsPerMinute = 200
  const wordCount = blog.content ? blog.content.split(/\s+/).length : 0
  const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute))

  return (
    <div className="min-h-screen">
      {/* Hero Section with Featured Image */}
      <div className="relative h-[40vh] md:h-[50vh] bg-amber-900">
        <Image
          src={blog.featured_image || "/placeholder.svg?height=500&width=1200&query=fashion blog"}
          alt={blog.title}
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white">
          <div className="container mx-auto">
            <div className="flex flex-wrap items-center text-sm text-amber-100 gap-4 mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {new Date(blog.publish_date || blog.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{readingTime} min read</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-light mb-4 text-white">{blog.title}</h1>
            {blogCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blogCategories.map((category: string) => (
                  <Link
                    key={category}
                    href={`/blog?category=${encodeURIComponent(category)}`}
                    className="bg-amber-700/80 hover:bg-amber-600 px-3 py-1 rounded-full text-sm text-white transition-colors"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm mb-8">
          <Link href="/" className="text-gray-500 hover:text-amber-700">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <Link href="/blog" className="text-gray-500 hover:text-amber-700">
            Blog
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="text-gray-900 truncate max-w-[200px]">{blog.title}</span>
        </div>

        {/* Debug Info (remove in production) */}
        {/* {process.env.NODE_ENV === "development" && (
          <div className="mb-4 p-4 bg-gray-100 rounded text-sm">
            <p>Debug Info:</p>
            <p>
              Categories: {blogCategories.length} - {blogCategories.join(", ") || "None"}
            </p>
            <p>
              Tags: {blogTags.length} - {blogTags.join(", ") || "None"}
            </p>
            <p>Raw categories: {JSON.stringify(blog.categories)}</p>
            <p>Raw tags: {JSON.stringify(blog.tags)}</p>
          </div>
        )} */}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Blog Content */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <div className="prose prose-lg max-w-none prose-headings:text-amber-900 prose-a:text-amber-700 prose-img:rounded-lg">
                {blog.excerpt && (
                  <div className="text-xl text-gray-600 mb-6 font-light italic border-l-4 border-amber-200 pl-4">
                    {blog.excerpt}
                  </div>
                )}
                <div dangerouslySetInnerHTML={{ __html: blog.content || "" }} />
              </div>
            </div>

            {/* Tags */}
            {blogTags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h3 className="text-lg font-medium mb-4 text-amber-900">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {blogTags.map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="bg-amber-50 px-3 py-1 rounded-full text-sm text-amber-800 hover:bg-amber-100 hover:text-amber-900 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-center flex-wrap gap-4">
                <span className="font-medium flex items-center text-amber-900">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share this post:
                </span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" className="rounded-full border-amber-200 hover:bg-amber-50">
                    <Facebook className="h-4 w-4 text-amber-700" />
                    <span className="sr-only">Share on Facebook</span>
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full border-amber-200 hover:bg-amber-50">
                    <Twitter className="h-4 w-4 text-amber-700" />
                    <span className="sr-only">Share on Twitter</span>
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full border-amber-200 hover:bg-amber-50">
                    <Linkedin className="h-4 w-4 text-amber-700" />
                    <span className="sr-only">Share on LinkedIn</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Related Posts */}
            {relatedBlogs && relatedBlogs.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-light mb-6 text-amber-900 border-b border-amber-100 pb-2">
                  Related Posts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedBlogs.map((relatedBlog: any) => (
                    <Link key={relatedBlog._id} href={`/blog/${relatedBlog.slug}`} className="group">
                      <div className="relative h-48 rounded-lg overflow-hidden mb-3">
                        <Image
                          src={relatedBlog.featured_image || "/placeholder.svg?height=192&width=300&query=fashion blog"}
                          alt={relatedBlog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="text-lg font-medium mb-1 group-hover:text-amber-700 transition-colors line-clamp-2">
                        {relatedBlog.title}
                      </h3>
                      <div className="text-xs text-gray-500 mb-2">
                        {new Date(relatedBlog.publish_date || relatedBlog.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{relatedBlog.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-7 sticky top-20 border border-amber-100">
              {blogCategories.length > 0 && (
                <>
                  <h2 className="text-xl font-medium mb-4 text-amber-900 border-b border-amber-100 pb-2">Categories</h2>
                  <ul className="space-y-2 mb-8">
                    {blogCategories.map((category: string) => (
                      <li key={category} className="group">
                        <Link
                          href={`/blog?category=${encodeURIComponent(category)}`}
                          className="text-gray-600 hover:text-amber-700 flex items-center group-hover:translate-x-1 transition-transform"
                        >
                          <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {category}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {blogTags.length > 0 && (
                <>
                  <h2 className="text-xl font-medium mb-4 text-amber-900 border-b border-amber-100 pb-2">Tags</h2>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {blogTags.map((tag: string) => (
                      <Link
                        key={tag}
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="bg-amber-50 px-3 py-1 rounded-full text-sm text-amber-800 hover:bg-amber-100 hover:text-amber-900 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </>
              )}

              <div className="bg-amber-50 p-3 rounded-lg ">
                <h3 className="font-medium text-amber-900 mb-2">Subscribe to our newsletter</h3>
                <p className="text-sm text-amber-800 mb-4">Get the latest fashion updates and exclusive offers.</p>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="text-sm w-30 border border-amber-200 rounded-l-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button className="bg-amber-700 text-white px-3 py-2 text-sm rounded-r-md hover:bg-amber-800 transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
