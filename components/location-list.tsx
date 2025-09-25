"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Trash2 } from "lucide-react"

interface Location {
  _id: string
  country: string
  state: string
  cities: string
  createdAt: string
}

interface LocationListProps {
  locations: Location[]
  onEdit: (location: Location) => void
  onDelete: () => void
}

export default function LocationList({ locations, onEdit, onDelete }: LocationListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/locations/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Location deleted successfully!",
        })
        onDelete()
      } else {
        throw new Error("Failed to delete location")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete location. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (locations.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No locations yet</h3>
          <p className="text-slate-500">Add your first location to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">📍 Saved Locations</h2>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {locations.length} location{locations.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="space-y-4">
        {locations.map((location) => (
          <Card
            key={location._id}
            className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200 group"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🌍</div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {location.country}
                    </CardTitle>
                    <p className="text-sm text-slate-500 mt-1">
                      Added {new Date(location.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(location)}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(location._id)}
                    disabled={deletingId === location._id}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                  >
                    {deletingId === location._id ? (
                      <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <span className="text-lg">🏛️</span>
                  <div>
                    <span className="text-sm font-medium text-slate-600">State/Province</span>
                    <p className="font-semibold text-slate-800">{location.state}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                  <span className="text-lg mt-0.5">🏙️</span>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-600">Cities</span>
                    <p className="font-semibold text-slate-800 leading-relaxed">{location.cities}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
