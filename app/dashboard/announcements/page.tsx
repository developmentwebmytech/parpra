"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Trash2, Edit, Plus, ArrowUp, ArrowDown } from "lucide-react"

interface Announcement {
  _id: string
  text: string
  link?: string
  isActive: boolean
  backgroundColor?: string
  textColor?: string
  position: number
  createdAt: string
  updatedAt: string
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/announcements")

      if (!response.ok) {
        throw new Error("Failed to fetch announcements")
      }

      const data = await response.json()
      setAnnouncements(data.announcements)
    } catch (error) {
      console.error("Error fetching announcements:", error)
      setError("Failed to load announcements. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete announcement")
      }

      // Refresh the list
      fetchAnnouncements()
    } catch (error) {
      console.error("Error deleting announcement:", error)
      setError("Failed to delete announcement. Please try again.")
    }
  }

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      const response = await fetch(`/api/admin/announcements/${announcement._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...announcement,
          isActive: !announcement.isActive,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update announcement")
      }

      // Refresh the list
      fetchAnnouncements()
    } catch (error) {
      console.error("Error updating announcement:", error)
      setError("Failed to update announcement. Please try again.")
    }
  }

  const handleMovePosition = async (id: string, direction: "up" | "down") => {
    const currentIndex = announcements.findIndex((a) => a._id === id)
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === announcements.length - 1)
    ) {
      return // Can't move further in this direction
    }

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    const currentAnnouncement = announcements[currentIndex]
    const swapAnnouncement = announcements[swapIndex]

    try {
      // Update the first announcement
      await fetch(`/api/admin/announcements/${currentAnnouncement._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...currentAnnouncement,
          position: swapAnnouncement.position,
        }),
      })

      // Update the second announcement
      await fetch(`/api/admin/announcements/${swapAnnouncement._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...swapAnnouncement,
          position: currentAnnouncement.position,
        }),
      })

      // Refresh the list
      fetchAnnouncements()
    } catch (error) {
      console.error("Error reordering announcements:", error)
      setError("Failed to reorder announcements. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Announcements</h1>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-8"> 
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <Link
          href="/dashboard/announcements/new"
          className="bg-teal-700 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-teal-800 transition-colors"
        >
          <Plus size={16} />
          Add New
        </Link>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {announcements.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded">
          <p className="text-gray-500">No announcements found. Create your first announcement!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Text</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {announcements.map((announcement) => (
                <tr key={announcement._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: announcement.backgroundColor || "#064e3b" }}
                      ></div>
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{announcement.text}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(announcement)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        announcement.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {announcement.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleMovePosition(announcement._id, "up")}
                        disabled={announcements.indexOf(announcement) === 0}
                        className={`p-1 rounded ${
                          announcements.indexOf(announcement) === 0
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => handleMovePosition(announcement._id, "down")}
                        disabled={announcements.indexOf(announcement) === announcements.length - 1}
                        className={`p-1 rounded ${
                          announcements.indexOf(announcement) === announcements.length - 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/dashboard/announcements/${announcement._id}`}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-gray-100"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(announcement._id)}
                        className="bg-gray-500 hover:bg-red-600 p-2 text-white rounded-md "
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
