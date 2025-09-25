"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Trash2, Upload } from "lucide-react"
import type { IVariation } from "@/lib/models"

const formSchema = z.object({
  size: z.enum(["XS", "S", "M", "L", "XL", "XXL"], {
    errorMap: () => ({ message: "Please select a valid size" }),
  }),
  color: z.string().min(1, "Color is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  salePrice: z.coerce.number().min(0, "Sale price must be a positive number").optional().nullable(),
  sku: z.string().min(1, "SKU is required"),
  quantity: z.coerce.number().min(0, "Quantity must be a positive number"),
  image: z.any().optional(),
  gallery: z.array(z.any()).optional(),
})

interface VariationFormProps {
  productId: string
  variation?: IVariation
}

export function VariationForm({ productId, variation }: VariationFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(variation?.image || null)
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(variation?.gallery || [])
  const [keepExistingImage, setKeepExistingImage] = useState(true)
  const [keepExistingGallery, setKeepExistingGallery] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      size: variation?.size || "M",
      color: variation?.color || "",
      price: variation?.price || 0,
      salePrice: variation?.salePrice || null,
      sku: variation?.sku || "",
      quantity: variation?.quantity || 0,
      image: undefined,
      gallery: [],
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setKeepExistingImage(false)
      }
      reader.readAsDataURL(file)
      form.setValue("image", file)
    }
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setKeepExistingGallery(false)

      const newPreviews: string[] = []
      const newFiles: File[] = []

      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result as string)
          setGalleryPreviews([...galleryPreviews, ...newPreviews])
        }
        reader.readAsDataURL(file)
        newFiles.push(file)
      })

      form.setValue("gallery", newFiles)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setKeepExistingImage(false)
    form.setValue("image", undefined)
  }

  const removeGalleryImage = (index: number) => {
    const newGalleryPreviews = [...galleryPreviews]
    newGalleryPreviews.splice(index, 1)
    setGalleryPreviews(newGalleryPreviews)

    // If we're removing from the existing gallery
    if (index < (variation?.gallery?.length || 0)) {
      setKeepExistingGallery(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("size", values.size)
      formData.append("color", values.color)
      formData.append("price", values.price.toString())
      if (values.salePrice) {
        formData.append("salePrice", values.salePrice.toString())
      }
      formData.append("sku", values.sku)
      formData.append("quantity", values.quantity.toString())

      if (values.image) {
        formData.append("image", values.image)
      }

      if (Array.isArray(values.gallery)) {
        values.gallery.forEach((file) => {
          formData.append("gallery", file)
        })
      }

      if (variation) {
        formData.append("keepExistingImage", keepExistingImage.toString())
        formData.append("keepExistingGallery", keepExistingGallery.toString())

        const response = await fetch(`/api/variations/${variation._id}`, {
          method: "PUT",
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to update variation")
        }

        toast({
          title: "Success",
          description: "Variation updated successfully",
        })
      } else {
        formData.append("product_id", productId)

        const response = await fetch("/api/variations", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to create variation")
        }

        toast({
          title: "Success",
          description: "Variation created successfully",
        })
      }

      router.push(`/dashboard/products/${productId}/variations`)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="XS">XS</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input placeholder="Enter color" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="Enter price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Price (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter sale price"
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number.parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="Enter SKU" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="Enter quantity" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Main Image</FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("variation-image")?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                      </Button>
                      <Input
                        id="variation-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        {...field}
                      />
                      {imagePreview && (
                        <Button type="button" variant="outline" size="icon" onClick={removeImage}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {imagePreview && (
                      <div className="relative h-40 w-40 overflow-hidden rounded-md border">
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          alt="Variation image preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gallery"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Gallery Images</FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("variation-gallery")?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Gallery
                      </Button>
                      <Input
                        id="variation-gallery"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleGalleryChange}
                        {...field}
                      />
                    </div>
                    {galleryPreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {galleryPreviews.map((preview, index) => (
                          <div key={index} className="relative h-24 w-24 overflow-hidden rounded-md border">
                            <Image
                              src={preview || "/placeholder.svg"}
                              alt={`Gallery image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute right-1 top-1 h-6 w-6"
                              onClick={() => removeGalleryImage(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {variation ? "Updating..." : "Creating..."}
              </>
            ) : variation ? (
              "Update Variation"
            ) : (
              "Create Variation"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/products/${productId}/variations`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
