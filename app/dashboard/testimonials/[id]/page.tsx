"use client"

import type React from "react"

import { useState, useEffect, type FormEvent, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Upload, Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { use } from "react"

interface Testimonial {
  _id?: string
  name: string
  role: string
  content: string
  rating: number
  image?: string
  isActive: boolean
}

export default function TestimonialEditPage({ params }: { params: Promise<{ id: string }>| Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const unwrappedParams = "then" in params ? use(params) : params
  const id = unwrappedParams.id

  const isNew = id === "new"
  const router = useRouter()
  const { toast } = useToast()

  const [testimonial, setTestimonial] = useState<Testimonial>({
    name: "",
    role: "",
    content: "",
    rating: 5,
    isActive: true,
  })

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [debugLogs, setDebugLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    
    setDebugLogs((prev) => [...prev, message])
  }

   const fetchTestimonial =useCallback( async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/testimonials/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch testimonial")
      }
      const data = await response.json()
      setTestimonial(data)

      if (data.image) {
        setImagePreview(data.image.startsWith("http") ? data.image : `/${data.image}`)
      }
    } catch (error) {
      console.error("Error fetching testimonial:", error)
      toast({
        title: "Error",
        description: "Failed to load testimonial",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast, id])
  useEffect(() => {
    if (!isNew) {
      fetchTestimonial()
    }
  }, [id, isNew, fetchTestimonial])

 

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setUploadError(null) // Clear any previous errors
      addLog(`File selected: ${file.name} (${file.size} bytes)`)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return testimonial.image || null

    setUploading(true)
    setUploadError(null)
    addLog(`Starting upload of ${imageFile.name}...`)

    try {
      const formData = new FormData()
      formData.append("file", imageFile)

      addLog(`Sending request to /api/upload-image with ${imageFile.name}`)

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      addLog(`Response status: ${response.status}`)

      // Check if the response is JSON
      const contentType = response.headers.get("content-type")
      addLog(`Response content type: ${contentType}`)

      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        addLog(`Non-JSON response: ${text.substring(0, 100)}...`)
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()
      addLog(`Response data: ${JSON.stringify(data)}`)

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image")
      }

      addLog(`Upload successful! URL: ${data.url}`)
      return data.url
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      addLog(`Upload error: ${errorMessage}`)
      setUploadError(`Failed to upload image: ${errorMessage}`)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (uploading) {
      toast({
        title: "Please wait",
        description: "Image is still uploading",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      addLog("Saving testimonial...")

      // Upload image if selected
      let imagePath = testimonial.image
      if (imageFile) {
        addLog("Uploading image before saving testimonial...")
        imagePath = (await uploadImage()) ?? undefined
        if (!imagePath && imageFile) {
          // If upload failed but we have an image file, stop submission
          setSaving(false)
          toast({
            title: "Error",
            description: uploadError || "Failed to upload image",
            variant: "destructive",
          })
          return
        }
      }

      const testimonialData = {
        ...testimonial,
        image: imagePath,
      }

      // Remove _id if it's a new testimonial
      if (isNew) {
        delete testimonialData._id
      }

      const url = isNew ? "/api/admin/testimonials" : `/api/admin/testimonials/${id}`
      addLog(`Sending ${isNew ? "POST" : "PUT"} request to ${url}`)

      const response = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testimonialData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        addLog(`Error response: ${errorText}`)
        throw new Error(`Failed to ${isNew ? "create" : "update"} testimonial`)
      }

      addLog("Testimonial saved successfully")
      toast({
        title: "Success",
        description: `Testimonial ${isNew ? "created" : "updated"} successfully`,
      })

      router.push("/dashboard/testimonials")
    } catch (error) {
      console.error(`Error ${isNew ? "creating" : "updating"} testimonial:`, error)
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error",
        description: `Failed to ${isNew ? "create" : "update"} testimonial`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTestimonial((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setTestimonial((prev) => ({ ...prev, isActive: checked }))
  }

  const handleRatingChange = (rating: number) => {
    setTestimonial((prev) => ({ ...prev, rating }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isNew ? "Add New Testimonial" : "Edit Testimonial"}</h1>
        <Button variant="ghost"  onClick={() => router.push("/dashboard/testimonials")} className="mr-4 bg-teal-500 text-white hover:bg-teal-700 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Testimonial Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="mb-4">
                  <Label htmlFor="name" className="text-lg mb-2 block">Name *</Label>
                  <Input id="name" name="name" value={testimonial.name} onChange={handleInputChange} required />
                </div>

                <div className="mb-4">
                  <Label htmlFor="role" className="text-lg mb-2 block">Address</Label>
                  <Input
                    id="role"
                    name="role"
                    value={testimonial.role}
                    onChange={handleInputChange}
                    placeholder="e.g. Ahmedabad, India"
                  />
                </div>

                <div className="mb-4">
                  <Label className="text-lg mb-2 block">Rating</Label>
                  <div className="flex space-x-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="isActive" checked={testimonial.isActive} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <div className="space-y-4 mb-4">
                <div>
                  <Label htmlFor="content" className="text-lg mb-2 block">Testimonial Content *</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={testimonial.content}
                    onChange={handleInputChange}
                    rows={5}
                    required
                  />
                </div>

                <div className="mb-4">
                  <Label htmlFor="image" className="text-lg mb-2 block">Profile Image</Label>
                  {uploadError && <div className="mt-1 text-sm text-red-600">{uploadError}</div>}
                  <div className="mt-2 flex items-center space-x-4">
                    {imagePreview ? (
                      <div className="relative h-20 w-20 rounded-full overflow-hidden">
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          alt="Profile preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}

                    <div>
                      <Label
                        htmlFor="image-upload"
                        className={`cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                          uploading ? "bg-gray-100 text-gray-500" : "text-gray-700 bg-white hover:bg-gray-50"
                        }`}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Image
                          </>
                        )}
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={uploading}
                      />
                      <p className="text-xs text-gray-500 mt-1">Recommended: Square image, at least 200x200px</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                className="text-lg bg-[#000000a3] font-light text-white hover:bg-teal-600 hover:text-white"
                variant="outline"
                onClick={() => router.push("/dashboard/testimonials")}
                disabled={saving || uploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || uploading}  className="text-lg  py-4 bg-teal-600 font-light hover:bg-teal-700">
                {saving ? "Saving..." : isNew ? "Create Testimonial" : "Update Testimonial"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {debugLogs.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Debug Logs</span>
              <Button variant="outline" size="sm" onClick={() => setDebugLogs([])}>
                Clear
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-md max-h-[200px] overflow-y-auto font-mono text-xs">
              {debugLogs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
