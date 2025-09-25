"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Plus, Edit, Trash2, Star, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Testimonial {
  _id: string
  name: string
  role: string
  content: string
  rating: number
  image?: string
  isActive: boolean
  createdAt: string
}

export default function TestimonialsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const fetchTestimonials = useCallback( async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/testimonials")
      if (!response.ok) {
        throw new Error("Failed to fetch testimonials")
      }
      const data = await response.json()
      setTestimonials(data)
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      toast({
        title: "Error",
        description: "Failed to load testimonials",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])
  useEffect(() => {
    fetchTestimonials()
  }, [fetchTestimonials])

  

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/admin/testimonials/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete testimonial")
      }

      setTestimonials((prev) => prev.filter((testimonial) => testimonial._id !== deleteId))
      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting testimonial:", error)
      toast({
        title: "Error",
        description: "Failed to delete testimonial",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
      setDeleteDialogOpen(false)
    }
  }

  const confirmDelete = (id: string) => {
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="px-7 py-8  ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Testimonials</h1>
        <Button className="bg-teal-600 hover:bg-teal-700 hover:text-white" onClick={() => router.push("/dashboard/testimonials/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {testimonials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-1">No testimonials found</p>
            <p className="text-gray-500 mb-4">Get started by creating your first testimonial</p>
            <Button onClick={() => router.push("/dashboard/testimonials/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial._id} className={!testimonial.isActive ? "opacity-60" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200 mr-3">
                      {testimonial.image ? (
                        <Image
                          src={`http://localhost:3000/${testimonial.image}`}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                          {testimonial.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{testimonial.name}</h3>
                      {testimonial.role && <p className="text-sm text-gray-500">{testimonial.role}</p>}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 line-clamp-3">{testimonial.content}</p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">{new Date(testimonial.createdAt).toLocaleDateString()}</div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/testimonials/${testimonial._id}`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-white bg-gray-500 hover:bg-red-600 hover:text-white transition-all" onClick={() => confirmDelete(testimonial._id)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the testimonial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
