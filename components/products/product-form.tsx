"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import type { IBrand, ICategory, IProduct } from "@/lib/models"

const formSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  brand_id: z.string().min(1, "Brand is required"),
  category_id: z.string().min(1, "Category is required"),
  material: z.string().optional(),
  tags: z.string().optional(),
  is_featured: z.boolean().default(false),
  is_best_seller: z.boolean().default(false),
})

interface ProductFormProps {
  product?: IProduct
  brands: IBrand[]
  categories: ICategory[]
}

// Helper function to extract ID from populated field
function extractId(field: any): string {
  if (!field) return ""
  if (typeof field === "string") return field
  if (typeof field === "object" && field._id) return field._id.toString()
  return field.toString()
}

// Helper function to format tags
function formatTags(tags: any): string {
  if (!tags) return ""
  if (Array.isArray(tags)) return tags.join(", ")
  if (typeof tags === "string") return tags
  return ""
}

export function ProductForm({ product, brands, categories }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      brand_id: "",
      category_id: "",
      material: "",
      tags: "",
      is_featured: false,
      is_best_seller: false,
    },
  })

  // Update form when product data changes
  useEffect(() => {
    if (product) {
      

      const brandId = extractId(product.brand_id)
      const categoryId = extractId(product.category_id)
      const tagsString = formatTags(product.tags)


      form.reset({
        name: product.name || "",
        description: product.description || "",
        brand_id: brandId,
        category_id: categoryId,
        material: product.material || "",
        tags: tagsString,
        is_featured: product.is_featured || false,
        is_best_seller: product.is_best_seller || false,
      })
    }
  }, [product, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Process tags
      const tags = values.tags
        ? values.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : []

      const productData = {
        ...values,
        tags,
      }

      if (product) {
        const response = await fetch(`/api/products/${product._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to update product")
        }

        toast({
          title: "Success",
          description: "Product updated successfully",
        })
      } else {
        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to create product")
        }

        toast({
          title: "Success",
          description: "Product created successfully",
        })
      }

      router.push("/dashboard/products")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel className="text-lg block">Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brand_id"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel className="text-lg block">Brand</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "undefined"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand._id.toString()} value={brand._id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel className="text-lg block">Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id.toString()} value={category._id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="material"
            render={({ field }) => (
              <FormItem   className="mb-4">
                <FormLabel  className="text-lg block">Material</FormLabel>
                <FormControl>
                  <Input placeholder="Enter material (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-lg block">Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter product description" className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel className="text-lg block">Tags</FormLabel>
                <FormControl>
                  <Input placeholder="Enter tags separated by commas" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col space-y-4">
            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-lg">Featured Product</FormLabel>
                    <p className="text-sm text-muted-foreground">This product will be displayed in featured sections</p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_best_seller"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-lg">Best Seller</FormLabel>
                    <p className="text-sm text-muted-foreground">This product will be marked as a best seller</p>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto text-lg  py-4 bg-teal-600 font-light hover:bg-teal-700">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {product ? "Updating..." : "Creating..."}
              </>
            ) : product ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/products")}
            className="w-full sm:w-auto text-lg bg-[#000000a3] font-light text-white hover:bg-teal-600 hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
