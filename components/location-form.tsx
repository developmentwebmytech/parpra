"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface LocationFormProps {
  location?: {
    _id?: string
    country: string
    state: string
    cities: string
  }
  onSuccess: () => void
  onCancel?: () => void
}

export default function LocationForm({ location, onSuccess, onCancel }: LocationFormProps) {
  const [formData, setFormData] = useState({
    country: location?.country || "",
    state: location?.state || "",
    cities: location?.cities || "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // helper: capitalize each word
  const capitalizeWords = (text: string) =>
    text
      .trim()
      .split(/\s+/) // split by spaces
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formattedData = {
        country: capitalizeWords(formData.country),
        state: capitalizeWords(formData.state),
        cities: formData.cities
          .split(",")
          .map(city => capitalizeWords(city))
          .join(", "),
      }

      const url = location?._id
        ? `/api/admin/locations/${location._id}`
        : "/api/admin/locations"
      const method = location?._id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Location ${location?._id ? "updated" : "created"} successfully!`,
        })
        onSuccess()
        if (!location?._id) {
          setFormData({ country: "", state: "", cities: "" })
        }
      } else {
        throw new Error("Failed to save location")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save location. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Card className="w-full border border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">
          {location?._id ? "Edit Location" : "Add New Location"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm font-medium text-gray-700">
              Country
            </Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Enter country name"
              required
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state" className="text-sm font-medium text-gray-700">
              State/Province
            </Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Enter state or province"
              required
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cities" className="text-sm font-medium text-gray-700">
              Cities
            </Label>
            <Input
              id="cities"
              name="cities"
              value={formData.cities}
              onChange={handleChange}
              placeholder="Enter cities (comma separated)"
              required
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : location?._id ? (
                "Update Location"
              ) : (
                "Store Location"
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-gray-300 hover:bg-gray-50 text-gray-700 bg-transparent"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
