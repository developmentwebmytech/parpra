"use client"

import type React from "react"

import { useState, useEffect, type FormEvent, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X, ImageIcon } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { use } from "react"

interface HomepageSection {
  _id?: string
  name: string
  type: string
  title?: string
  subtitle?: string
  image?: string
  position: number
  isActive: boolean
  config?: Record<string, any>
}

const sectionTypes = [
  { value: "banner", label: "Banner" },
  { value: "featured-categories", label: "Featured Categories" },
  { value: "new-arrivals", label: "New Arrivals" },
  { value: "best-sellers", label: "Best Sellers" },
  { value: "featured-collections", label: "Featured Collections" },
  { value: "testimonials", label: "Testimonials" },
  { value: "instagram-feed", label: "Instagram Feed" },
  { value: "custom", label: "Custom Section" },
]

export default function HomepageSectionEditPage({ params }: { params: Promise<{ id: string }>| Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const unwrappedParams = "then" in params ? use(params) : params
  const id = unwrappedParams.id

  const isNew = id === "new"
  const router = useRouter()
  const { toast } = useToast()

  const [section, setSection] = useState<HomepageSection>({
    name: "",
    type: "banner",
    title: "",
    subtitle: "",
    image: "",
    position: 999, // Default to end of list
    isActive: true,
    config: {},
  })

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [existingSections, setExistingSections] = useState<HomepageSection[]>([])
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const addLog = (message: string) => {
    setDebugLogs((prev) => [...prev, message])
  }
  const fetchSection =useCallback( async () => {
    try {
      setLoading(true)
      addLog(`Fetching section with ID: ${id}`)
      const response = await fetch(`/api/admin/homepage-sections/${id}`)
      if (!response.ok) {
        addLog(`Error response: ${response.status}`)
        throw new Error("Failed to fetch section")
      }
      const data = await response.json()
      setSection(data)
      addLog(`Section loaded: ${data.name}`)

      // Set image preview if image exists
      if (data.image) {
        setImagePreview(data.image)
        addLog(`Image preview set: ${data.image}`)
      }
    } catch (error) {
      console.error("Error fetching section:", error)
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error",
        description: "Failed to load section",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    const fetchExistingSections = async () => {
    try {
      addLog("Fetching existing homepage sections...")
      const response = await fetch("/api/admin/homepage-sections")
      if (response.ok) {
        const data = await response.json()
        setExistingSections(data)
        addLog(`Fetched ${data.length} existing sections`)

        // If creating a new section, set position to be after the last section
        if (isNew && data.length > 0) {
          const maxPosition = Math.max(...data.map((s: HomepageSection) => s.position))
          setSection((prev) => ({ ...prev, position: maxPosition + 10 })) // Add some space between positions
          addLog(`Set new section position to ${maxPosition + 10}`)
        }
      } else {
        addLog(`Error fetching sections: ${response.status}`)
      }
    } catch (error) {
      console.error("Error fetching existing sections:", error)
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
    fetchExistingSections()

    if (!isNew) {
      fetchSection()
    }
  }, [id, isNew,fetchSection])

  

  

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    addLog(`Image file selected: ${file.name}`)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
      addLog("Image preview created")
    }
    reader.readAsDataURL(file)
  }

  const uploadImage = async () => {
    if (!imageFile) return null

    try {
      setUploadingImage(true)
      addLog(`Uploading image: ${imageFile.name}`)

      const formData = new FormData()
      formData.append("file", imageFile)

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      addLog(`Image uploaded successfully: ${data.url}`)
      return data.url
    } catch (error) {
      console.error("Error uploading image:", error)
      addLog(`Error uploading image: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      addLog("Saving homepage section...")

      // Upload image if selected
      let imageUrl = section.image
      if (imageFile) {
        imageUrl = await uploadImage()
        if (!imageUrl) {
          throw new Error("Failed to upload image")
        }
        addLog(`Image URL set: ${imageUrl}`)
      }

      const sectionData = {
        ...section,
        image: imageUrl,
      }

      // Remove _id if it's a new section
      if (isNew) {
        delete sectionData._id
        addLog("Creating new section")
      } else {
        addLog(`Updating section with ID: ${id}`)
      }

      const url = isNew ? "/api/admin/homepage-sections" : `/api/admin/homepage-sections/${id}`
      addLog(`Sending ${isNew ? "POST" : "PUT"} request to ${url}`)
      addLog(`Section data: ${JSON.stringify(sectionData)}`)

      const response = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sectionData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        addLog(`Error response: ${errorText}`)
        throw new Error(`Failed to ${isNew ? "create" : "update"} section`)
      }

      const savedData = await response.json()
      addLog(`Section ${isNew ? "created" : "updated"} successfully with ID: ${savedData._id}`)
      addLog(`Saved data: ${JSON.stringify(savedData)}`)

      toast({
        title: "Success",
        description: `Section ${isNew ? "created" : "updated"} successfully`,
      })

      router.push("/dashboard/homepage")
    } catch (error) {
      console.error(`Error ${isNew ? "creating" : "updating"} section:`, error)
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error",
        description: `Failed to ${isNew ? "create" : "update"} section`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSection((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setSection((prev) => ({ ...prev, isActive: checked }))
  }

  const handleTypeChange = (value: string) => {
    setSection((prev) => ({ ...prev, type: value }))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setSection((prev) => ({ ...prev, image: "" }))
    addLog("Image removed")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isNew ? "Add New Section" : "Edit Section"}</h1>
        <Button variant="ghost"  onClick={() => router.push("/dashboard/homepage")} className="mr-4 bg-teal-600 hover:bg-teal-700 text-white
        hover:text-white transition">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Section Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="mb-4">
                  <Label htmlFor="name" className=" text-lg mb-2 block ">Section Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={section.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Hero Banner, Featured Products"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This is for admin reference only and won't be displayed on the frontend
                  </p>
                </div>

                <div className="mb-4">
                  <Label htmlFor="type" className="text-lg mb-2 block">Section Type *</Label>
                  <Select value={section.type} onValueChange={handleTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section type" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-4">
                  <Label htmlFor="position" className="text-lg mb-2 block">Position</Label>
                  <Input
                    id="position"
                    name="position"
                    type="number"
                    value={section.position}
                    onChange={handleInputChange}
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Determines the order of sections on the homepage (lower numbers appear first)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="isActive" checked={section.isActive} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <div className="space-y-4 mb-4">
                <div>
                  <Label htmlFor="title" className="text-lg mb-2 block">Section Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={section.title || ""}
                    onChange={handleInputChange}
                    placeholder="e.g. Featured Products, New Arrivals"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be displayed as the heading for this section (optional)
                  </p>
                </div>

                <div className="mb-4">
                  <Label htmlFor="subtitle" className="text-lg mb-2 block">Section Subtitle</Label>
                  <Textarea
                    id="subtitle"
                    name="subtitle"
                    value={section.subtitle || ""}
                    onChange={handleInputChange}
                    placeholder="e.g. Discover our latest collection"
                    rows={3}
                  />
                </div>

                <div className="mb-4">
                  <Label htmlFor="image" className="text-lg mb-2 block">Section Image</Label>
                  <div className="mt-2">
                    {imagePreview ? (
                      <div className="relative w-full h-48 mb-4 border rounded-md overflow-hidden">
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          alt="Section image preview"
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-48 mb-4 border-2 border-dashed border-gray-300 rounded-md">
                        <div className="flex flex-col items-center">
                          <ImageIcon className="h-10 w-10 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">No image selected</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">
                          <Upload className="h-4 w-4" />
                          <span>{imagePreview ? "Change Image" : "Upload Image"}</span>
                        </div>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
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
                onClick={() => router.push("/dashboard/homepage")}
                disabled={saving || uploadingImage}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || uploadingImage} className="text-lg  py-4 bg-teal-600 font-light hover:bg-teal-700">
                {saving || uploadingImage ? "Saving..." : isNew ? "Create Section" : "Update Section"}
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
              <Button variant="outline" size="sm" className="text-md hover:bg-teal-600 hover:text-white" onClick={() => setDebugLogs([])}>
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
