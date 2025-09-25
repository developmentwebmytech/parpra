"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface AnnouncementFormData {
  text: string
  link: string
  isActive: boolean
  backgroundColor: string
  textColor: string
}

export default  function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const [formData, setFormData] = useState<AnnouncementFormData>({
    text: "",
    link: "",
    isActive: true,
    backgroundColor: "#064e3b",
    textColor: "#ffffff",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const [id, setId] = useState<string>("")
  useEffect(() => {
    const fetchId = async () => {
      const resolvedParams = await params
      setId(resolvedParams.id)
    }
    fetchId()
  }, [params])

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/announcements/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch announcement")
        }

        const data = await response.json()
        setFormData({
          text: data.announcement.text,
          link: data.announcement.link || "",
          isActive: data.announcement.isActive,
          backgroundColor: data.announcement.backgroundColor || "#064e3b",
          textColor: data.announcement.textColor || "#ffffff",
        })
      } catch (error) {
        console.error("Error fetching announcement:", error)
        setError("Failed to load announcement. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncement()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement
      setFormData({
        ...formData,
        [name]: target.checked,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.text) {
      setError("Announcement text is required")
      return
    }

    try {
      setSaving(true)
      setError("")

      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update announcement")
      }

      router.push("/dashboard/announcements")
    } catch (error) {
      console.error("Error updating announcement:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link href="/dashboard/announcements" className="text-teal-700 hover:text-teal-900 flex items-center gap-1">
            <ArrowLeft size={16} />
            Back to Announcements
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">Edit Announcement</h1>

        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/dashboard/announcements" className="text-teal-700 hover:text-teal-900 flex items-center gap-1">
          <ArrowLeft size={16} />
          Back to Announcements
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Edit Announcement</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
              Announcement Text*
            </label>
            <textarea
              id="text"
              name="text"
              rows={2}
              value={formData.text}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter announcement text"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
              Link (Optional)
            </label>
            <input
              type="text"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              placeholder="https://example.com/page"
            />
            <p className="mt-1 text-sm text-gray-500">
              If provided, the announcement will be clickable and link to this URL
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 mb-1">
                Background Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  id="backgroundColor"
                  name="backgroundColor"
                  value={formData.backgroundColor}
                  onChange={handleChange}
                  className="h-10 w-10 border border-gray-300 rounded mr-2"
                />
                <input
                  type="text"
                  value={formData.backgroundColor}
                  onChange={handleChange}
                  name="backgroundColor"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="textColor" className="block text-sm font-medium text-gray-700 mb-1">
                Text Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  id="textColor"
                  name="textColor"
                  value={formData.textColor}
                  onChange={handleChange}
                  className="h-10 w-10 border border-gray-300 rounded mr-2"
                />
                <input
                  type="text"
                  value={formData.textColor}
                  onChange={handleChange}
                  name="textColor"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">Only active announcements will be displayed on the website</p>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Link
              href="/dashboard/announcements"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Preview</h2>
        <div
          className="p-3 rounded"
          style={{
            backgroundColor: formData.backgroundColor,
            color: formData.textColor,
          }}
        >
          {formData.text || "Announcement text will appear here"}
        </div>
      </div>
    </div>
  )
}
