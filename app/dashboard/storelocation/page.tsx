"use client"

import { useState, useEffect } from "react"
import LocationForm from "@/components/location-form"
import LocationList from "@/components/location-list"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { Plus, MapPin } from "lucide-react"

interface Location {
  _id: string
  country: string
  state: string
  cities: string
  createdAt: string
}

export default function HomePage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/admin/locations")
      if (response.ok) {
        const data = await response.json()
        setLocations(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch locations:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  const handleFormSuccess = () => {
    fetchLocations()
    setEditingLocation(null)
    setShowForm(false)
  }

  const handleEdit = (location: Location) => {
    setEditingLocation(location)
    setShowForm(true)
  }

  const handleCancelEdit = () => {
    setEditingLocation(null)
    setShowForm(false)
  }

  const handleAddLocation = () => {
    setEditingLocation(null)
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm md:text-base">Loading locations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Location Management</h1>
              <p className="text-gray-600 text-sm sm:text-base">Manage your global locations efficiently</p>
            </div>
          </div>
          <Button
            onClick={handleAddLocation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium shadow-sm transition-colors duration-200 flex items-center justify-center w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Add New Location
          </Button>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 sm:gap-8">
          {showForm && (
            <div className="space-y-4">
              {editingLocation && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-800 font-medium text-sm sm:text-base">Editing: {editingLocation.country}</span>
                  </div>
                </div>
              )}
              <LocationForm location={editingLocation} onSuccess={handleFormSuccess} onCancel={handleCancelEdit} />
            </div>
          )}

          <div className={`${showForm ? "" : "lg:col-span-2"} max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}>
            <LocationList locations={locations} onEdit={handleEdit} onDelete={fetchLocations} />
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  )
}