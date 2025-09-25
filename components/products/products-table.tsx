"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, Layers, Star, Award, ImageIcon } from "lucide-react"
import type { IProduct } from "@/lib/models"
import { Pagination } from "@/components/pagination"

interface ProductsTableProps {
  products: IProduct[]
  totalPages: number
  page: number
  per_page: number
}

export function ProductsTable({ products, totalPages, page, per_page }: ProductsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setIsDeleting(id)

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete product")
      }

      toast({
        title: "Success",
        description: "Product deleted successfully",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const toggleStatus = async (product: any, field: "is_featured" | "is_best_seller", currentValue: boolean) => {
    setIsUpdating(product._id.toString())

    try {
      // Use the slug-based endpoint for status updates
      const response = await fetch(`/api/products/${product.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [field]: !currentValue,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to update product ${field}`)
      }

      toast({
        title: "Success",
        description: `Product ${field.replace("is_", "").replace("_", " ")} status updated`,
      })

      router.refresh()
    } catch (error) {
      console.error("Toggle status error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  // Helper function to get the first available image from variations
  const getProductImage = (product: any) => {
    // Check if product has variations with images
    if (product.variations && product.variations.length > 0) {
      const firstVariation = product.variations[0]
      if (firstVariation.image) {
        return firstVariation.image
      }
      if (firstVariation.gallery && firstVariation.gallery.length > 0) {
        return firstVariation.gallery[0]
      }
    }
    return null
  }

  // Handle row click to navigate to product detail
  const handleRowClick = (productId: string, event: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons or interactive elements
    const target = event.target as HTMLElement
    const isButton = target.closest("button") || target.closest('[role="button"]') || target.closest("a")

    if (!isButton) {
      router.push(`/products/${productId}`)
    }
  }

  // Handle action button clicks to prevent row navigation
  const handleActionClick = (event: React.MouseEvent) => {
    event.stopPropagation()
  }

  return (
   <div className="space-y-4">
  <div className="rounded-md border p-4 mb-6"> {/* Added padding and bottom margin here */}
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="w-[180px]">Created At</TableHead>
          <TableHead className="text-right w-[150px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              No products found.
            </TableCell>
          </TableRow>
        ) : (
          products.map((product) => {
            const productImage = getProductImage(product)

            return (
              <TableRow
                key={product._id.toString()}
                className="cursor-pointer hover:bg-muted/50 transition-colors border-b" // Added bottom border for spacing
                onClick={(e) => handleRowClick(product.slug, e)}
              >
                <TableCell>
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    {productImage ? (
                      <Image
                        src={productImage || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-sm text-muted-foreground line-clamp-1">{product.description}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {/* @ts-ignore - brand_id is populated */}
                  {product.brand_id?.name || "Unknown"}
                </TableCell>
                <TableCell>
                  {/* @ts-ignore - category_id is populated */}
                  {product.category_id?.name || "Unknown"}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2" onClick={handleActionClick}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={product.is_featured ? "text-yellow-500" : "text-muted-foreground"}
                      onClick={() => toggleStatus(product, "is_featured", product.is_featured)}
                      disabled={isUpdating === product._id.toString()}
                      title={product.is_featured ? "Remove from featured" : "Add to featured"}
                    >
                      <Star className="h-5 w-5" fill={product.is_featured ? "currentColor" : "none"} />
                      <span className="sr-only">
                        {product.is_featured ? "Remove from featured" : "Add to featured"}
                      </span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className={product.is_best_seller ? "text-green-500" : "text-muted-foreground"}
                      onClick={() => toggleStatus(product, "is_best_seller", product.is_best_seller)}
                      disabled={isUpdating === product._id.toString()}
                      title={product.is_best_seller ? "Remove from best sellers" : "Add to best sellers"}
                    >
                      <Award className="h-5 w-5" fill={product.is_best_seller ? "currentColor" : "none"} />
                      <span className="sr-only">
                        {product.is_best_seller ? "Remove from best sellers" : "Add to best sellers"}
                      </span>
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2" onClick={handleActionClick}>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/products/${product._id}/variations`}>
                        <Layers className="h-4 w-4" />
                        <span className="sr-only">Variations</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/products/${product._id}`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive   bg-gray-500 text-white hover:bg-red-600 hover:text-white">
                          <Trash2 className="h-4 w-4 " />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the product and all its variations. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product._id.toString())}
                            disabled={isDeleting === product._id.toString()}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting === product._id.toString() ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  </div>

  <Pagination totalPages={totalPages} currentPage={page} />
</div>

  )
}
