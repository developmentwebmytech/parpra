"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Save, Trash, Upload, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BlogData {
  _id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string
  author: string
  categories: string[]
  tags: string[]
  published: boolean
  publish_date: string
  meta_title: string
  meta_description: string
}

export default  function BlogEditPage({ params }: { params: Promise<{ id: string }>}) {
  const [id, setId] = useState<string>("")
  useEffect(() => {
    const fetchId = async () => {
      const param = await params
      setId(param.id)
    }
    fetchId()
  }, [params])
  
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [blogData, setBlogData] = useState<BlogData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    author: session?.user?.name || "",
    categories: [],
    tags: [],
    published: true,
    publish_date: new Date().toISOString().split("T")[0],
    meta_title: "",
    meta_description: "",
  })
const isNew = id === "new"
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [newCategory, setNewCategory] = useState("")
  const [newTag, setNewTag] = useState("")
  const [existingCategories, setExistingCategories] = useState<string[]>([])
  const [existingTags, setExistingTags] = useState<string[]>([])
  
   
  const fetchBlog = useCallback(async () => {
    try {
      
      const response = await fetch(`/api/admin/blogs/${id}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response from API:", errorText)
        throw new Error(`Failed to fetch blog: ${response.status} ${response.statusText}`)
      }

      const blog = await response.json()
      
      setBlogData(blog)
      setImagePreview(blog.featured_image)
    } catch (error) {
      console.error("Error fetching blog:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch blog",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    if (status === "authenticated") {
      // Only fetch blog if we're editing an existing blog (not creating a new one)
      if (!isNew) {
        fetchBlog()
      } else {
        // For new blogs, we're not loading anything
        setIsLoading(false)

        // Set author from session if available
        if (session?.user?.name) {
          setBlogData((prev) => ({
            ...prev,
            author: session.user.name || "",
          }))
        }
      }

      // Always fetch categories and tags
      fetchCategoriesAndTags()
    } else if (status === "unauthenticated") {
      router.push("/login?redirect=/admin/blogs")
    }
  }, [status, id, session?.user?.name, isNew, router, fetchBlog])

  

  const fetchCategoriesAndTags = async () => {
    try {
      const response = await fetch(`/api/blogs/categories-tags`)

      if (response.ok) {
        const { categories, tags } = await response.json()
        setExistingCategories(categories || [])
        setExistingTags(tags || [])
      }
    } catch (error) {
      console.error("Error fetching categories and tags:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBlogData((prev) => ({ ...prev, [name]: value }))

    // Auto-generate slug from title
    if (name === "title" && (isNew || !blogData.slug)) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
      setBlogData((prev) => ({ ...prev, slug }))
    }
  }

  const handleImageClick = () => {
    // Programmatically click the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))

      // Clear any previous error messages related to images
      toast({
        title: "Image selected",
        description: "Don't forget to save to upload the image",
      })
    }
  }

  const handleAddCategory = () => {
    if (newCategory && !blogData.categories.includes(newCategory)) {
      setBlogData((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory],
      }))
      setNewCategory("")
    }
  }

  const handleAddTag = () => {
    if (newTag && !blogData.tags.includes(newTag)) {
      setBlogData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }))
      setNewTag("")
    }
  }

  const handleRemoveCategory = (category: string) => {
    setBlogData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }))
  }

  const handleRemoveTag = (tag: string) => {
    setBlogData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handlePublishedChange = (checked: boolean) => {
    setBlogData((prev) => ({ ...prev, published: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Validate required fields
      const requiredFields = ["title", "slug", "excerpt", "content", "author"]
      for (const field of requiredFields) {
        if (!blogData[field as keyof BlogData]) {
          toast({
            title: "Validation Error",
            description: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }
      }

      // Check if we have either an existing image or a new one
      if (!blogData.featured_image && !imageFile) {
        toast({
          title: "Validation Error",
          description: "Featured image is required",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      // Upload image if a new one is selected
      let imageUrl = blogData.featured_image
      if (imageFile) {
        try {
          const formData = new FormData()
          formData.append("file", imageFile)

      
          const uploadResponse = await fetch("/api/upload-image", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            let errorMessage = "Failed to upload image"
            try {
              const errorData = await uploadResponse.json()
              errorMessage = errorData.error || errorMessage
            } catch (e) {
              console.error("Error parsing upload response:", e)
              const responseText = await uploadResponse.text()
              console.error("Raw response:", responseText)
            }
            throw new Error(errorMessage)
          }

          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.url
        } catch (error) {
          console.error("Error uploading image:", error)
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }
      }

      // Prepare data for submission
      const dataToSubmit = {
        ...blogData,
        featured_image: imageUrl,
      }

     

      // Create or update the blog
      const url = isNew ? "/api/admin/blogs" : `/api/admin/blogs/${id}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      })

      // Check for non-JSON responses
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text()
        console.error("Non-JSON response received:", responseText)
        throw new Error("Server returned non-JSON response")
      }

      let responseData
      try {
        responseData = await response.json()
      } catch (e) {
        console.error("Error parsing response:", e)
        throw new Error("Failed to parse server response")
      }

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to save blog")
      }

     

      toast({
        title: "Success",
        description: isNew ? "Blog created successfully" : "Blog updated successfully",
      })

      // Redirect to blogs list
      router.push("/dashboard/blogs")
    } catch (error) {
      console.error("Error saving blog:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save blog",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-16 h-16 border-4 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-10 py-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" asChild className=" hover:bg-teal-600 hover:text-white"> 
            <Link href="/dashboard/blogs">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">{isNew ? "Create New Blog Post" : "Edit Blog Post"}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-lg bg-[#000000a3] font-light text-white hover:bg-teal-600 hover:text-white" onClick={() => router.push("/dashboard/blogs")}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving} className="text-lg  py-4 bg-teal-600 font-light hover:bg-teal-700">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Tabs defaultValue="content">
          <TabsList className="mb-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {/* Title and Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-lg">Title</Label>
                <Input id="title" name="title" value={blogData.title} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-lg">Slug</Label>
                <Input id="slug" name="slug" value={blogData.slug} onChange={handleInputChange} required />
              </div>
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <Label className="text-lg mt-4">Featured Image</Label>
              <div className="border rounded-md p-4 bg-gray-50">
                {imagePreview ? (
                  <div className="relative">
                    <div className="relative aspect-video w-full max-h-[500px] rounded-md overflow-hidden">
                      <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 bg-black"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview("")
                        setBlogData((prev) => ({ ...prev, featured_image: "" }))
                      }}
                    >
                      <Trash className="h-4 w-4 text-white" />
                      <span className="sr-only">Remove image</span>
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center h-[200px] bg-gray-100 rounded-md cursor-pointer"
                    onClick={handleImageClick}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-4">Drag and drop or click to upload</p>
                    <Button type="button" size="sm" variant="outline">
                      Choose Image
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  aria-label="Upload featured image"
                />
                <p className="text-xs text-gray-500 mt-2">Recommended size: 1200x630 pixels (16:9 ratio)</p>
              </div>
            </div>

            {/* Author */}
            <div className="space-y-4 mt-6">
              <Label htmlFor="author" className="text-lg mb-4">Author</Label>
              <Input id="author" name="author" value={blogData.author} onChange={handleInputChange} />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt" className="text-lg mb-2">Excerpt</Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                value={blogData.excerpt}
                onChange={handleInputChange}
                rows={3}
                required
              />
              <p className="text-xs text-gray-500">
                A short summary of the blog post. Displayed in blog listings and search results.
              </p>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-lg mb-2">Content</Label>
              <Textarea
                id="content"
                name="content"
                value={blogData.content}
                onChange={handleInputChange}
                rows={15}
                required
              />
            </div>

            {/* Categories and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-medium">Categories</h3>
                  <div className="flex gap-2">
                    <Input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Add a category"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddCategory()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={handleAddCategory}>
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add category</span>
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {blogData.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {blogData.categories.map((category) => (
                          <Badge key={category} variant="secondary" className="flex items-center gap-1">
                            {category}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 rounded-full"
                              onClick={() => handleRemoveCategory(category)}
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Remove {category}</span>
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No categories added</p>
                    )}
                  </div>
                  {existingCategories.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Existing categories:</p>
                      <div className="flex flex-wrap gap-2">
                        {existingCategories
                          .filter((category) => !blogData.categories.includes(category))
                          .slice(0, 10)
                          .map((category) => (
                            <Badge
                              key={category}
                              variant="outline"
                              className="cursor-pointer hover:bg-gray-100"
                              onClick={() => {
                                setBlogData((prev) => ({
                                  ...prev,
                                  categories: [...prev.categories, category],
                                }))
                              }}
                            >
                              {category}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-medium">Tags</h3>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={handleAddTag}>
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add tag</span>
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {blogData.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {blogData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 rounded-full"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Remove {tag}</span>
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No tags added</p>
                    )}
                  </div>
                  {existingTags.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Existing tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {existingTags
                          .filter((tag) => !blogData.tags.includes(tag))
                          .slice(0, 10)
                          .map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="cursor-pointer hover:bg-gray-100"
                              onClick={() => {
                                setBlogData((prev) => ({
                                  ...prev,
                                  tags: [...prev.tags, tag],
                                }))
                              }}
                            >
                              {tag}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Publishing Options */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium">Publishing Options</h3>
                <div className="flex items-center space-x-2">
                  <Switch id="published" checked={blogData.published} onCheckedChange={handlePublishedChange} />
                  <Label htmlFor="published">{blogData.published ? "Published" : "Draft"}</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publish_date">Publish Date</Label>
                  <Input
                    id="publish_date"
                    name="publish_date"
                    type="date"
                    value={blogData.publish_date}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium">SEO Settings</h3>
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    name="meta_title"
                    value={blogData.meta_title}
                    onChange={handleInputChange}
                    placeholder={blogData.title}
                  />
                  <p className="text-xs text-gray-500">If left empty, the post title will be used</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    name="meta_description"
                    value={blogData.meta_description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder={blogData.excerpt}
                  />
                  <p className="text-xs text-gray-500">If left empty, the post excerpt will be used</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
