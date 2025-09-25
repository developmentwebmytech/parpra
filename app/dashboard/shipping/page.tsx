"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

interface ShippingMethod {
  name: string
  time: string
  cost: string
  icon: string
}

interface ShippingInfo {
  _id: string
  type:
    | "domestic"
    | "international"
    | "return-eligibility"
    | "non-returnable"
    | "return-process"
    | "refunds"
    | "exchanges"
    | "damaged"
  title: string
  content: string
  items?: string[]
  methods?: ShippingMethod[]
  order: number
  lastUpdated: string
}

export default function AdminShippingPage() {
  const { toast } = useToast()
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("shipping")

  // For editing shipping info
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    type: "domestic",
    title: "",
    content: "",
    items: [] as string[],
    methods: [] as ShippingMethod[],
    order: 0,
  })

  // For items and methods
  const [currentItem, setCurrentItem] = useState("")
  const [currentMethod, setCurrentMethod] = useState({
    name: "",
    time: "",
    cost: "",
    icon: "Truck",
  })

  useEffect(() => {
    fetchShippingInfo()
  }, [])

  const fetchShippingInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/shipping-info")
      if (response.ok) {
        const data = await response.json()
        setShippingInfo(data)
      } else {
        console.error("Failed to fetch shipping information")
      }
    } catch (error) {
      console.error("Error fetching shipping information:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleMethodChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof ShippingMethod,
  ) => {
    setCurrentMethod((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const addItem = () => {
    if (currentItem.trim()) {
      setFormData((prev) => ({
        ...prev,
        items: [...(prev.items || []), currentItem.trim()],
      }))
      setCurrentItem("")
    }
  }

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index) || [],
    }))
  }

  const addMethod = () => {
    if (currentMethod.name.trim() && currentMethod.time.trim() && currentMethod.cost.trim()) {
      setFormData((prev) => ({
        ...prev,
        methods: [...(prev.methods || []), { ...currentMethod }],
      }))
      setCurrentMethod({
        name: "",
        time: "",
        cost: "",
        icon: "Truck",
      })
    }
  }

  const removeMethod = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      methods: prev.methods?.filter((_, i) => i !== index) || [],
    }))
  }

  const startAdding = () => {
    setIsAdding(true)
    setIsEditing(null)
    setFormData({
      type: "domestic",
      title: "",
      content: "",
      items: [],
      methods: [],
      order: shippingInfo.length + 1,
    })
    setCurrentItem("")
    setCurrentMethod({
      name: "",
      time: "",
      cost: "",
      icon: "Truck",
    })
  }

  const cancelAdding = () => {
    setIsAdding(false)
  }

  const startEditing = (item: ShippingInfo) => {
    setIsEditing(item._id)
    setIsAdding(false)
    setFormData({
      type: item.type,
      title: item.title,
      content: item.content || "",
      items: item.items || [],
      methods: item.methods || [],
      order: item.order,
    })
    setCurrentItem("")
    setCurrentMethod({
      name: "",
      time: "",
      cost: "",
      icon: "Truck",
    })
  }

  const cancelEditing = () => {
    setIsEditing(null)
  }

  const saveShippingInfo = async () => {
    try {
      const response = await fetch("/api/shipping-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Shipping information added successfully",
        })
        setIsAdding(false)
        fetchShippingInfo()
      } else {
        toast({
          title: "Failed to add shipping information",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding shipping information:", error)
      toast({
        title: "An error occurred",
        variant: "destructive",
      })
    }
  }

  const updateShippingInfo = async () => {
    if (!isEditing) return

    try {
      const response = await fetch(`/api/shipping-info/${isEditing}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Shipping information updated successfully",
        })
        setIsEditing(null)
        fetchShippingInfo()
      } else {
        toast({
          title: "Failed to update shipping information",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating shipping information:", error)
      toast({
        title: "An error occurred",
        variant: "destructive",
      })
    }
  }

  const deleteShippingInfo = async (id: string) => {
    try {
      const response = await fetch(`/api/shipping-info/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Shipping information deleted successfully",
        })
        fetchShippingInfo()
      } else {
        toast({
          title: "Failed to delete shipping information",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting shipping information:", error)
      toast({
        title: "An error occurred",
        variant: "destructive",
      })
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "domestic":
        return "Domestic Shipping"
      case "international":
        return "International Shipping"
      case "return-eligibility":
        return "Return Eligibility"
      case "non-returnable":
        return "Non-Returnable Items"
      case "return-process":
        return "Return Process"
      case "refunds":
        return "Refunds"
      case "exchanges":
        return "Exchanges"
      case "damaged":
        return "Damaged Items"
      default:
        return type
    }
  }

  const renderForm = () => {
    return (
      <div className="space-y-4  px-7">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="domestic">Domestic Shipping</option>
              <option value="international">International Shipping</option>
              <option value="return-eligibility">Return Eligibility</option>
              <option value="non-returnable">Non-Returnable Items</option>
              <option value="return-process">Return Process</option>
              <option value="refunds">Refunds</option>
              <option value="exchanges">Exchanges</option>
              <option value="damaged">Damaged Items</option>
            </select>
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Domestic Shipping"
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content (Optional)
          </label>
          <Textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={4}
            placeholder="Enter content text here..."
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
            Display Order
          </label>
          <Input
            id="order"
            name="order"
            type="number"
            value={formData.order}
            onChange={handleInputChange}
            className="w-full max-w-xs"
          />
        </div>

        {(formData.type === "return-eligibility" ||
          formData.type === "non-returnable" ||
          formData.type === "return-process" ||
          formData.type === "refunds") && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Items/Steps</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add new item"
                  value={currentItem}
                  onChange={(e) => setCurrentItem(e.target.value)}
                  className="w-64"
                />
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus size={14} className="mr-1" /> Add
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-2">
              {formData.items && formData.items.length > 0 ? (
                <ul className="space-y-2">
                  {formData.items.map((item, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-white p-2 rounded border border-gray-100"
                    >
                      <span className="text-sm">{item}</span>
                      <Button
                        type="button"
                        onClick={() => removeItem(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={14} />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No items added yet.</p>
              )}
            </div>
          </div>
        )}

        {(formData.type === "domestic" || formData.type === "international") && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Shipping Methods</label>
              <Button type="button" onClick={addMethod} variant="outline" size="sm">
                <Plus size={14} className="mr-1" /> Add Method
              </Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  placeholder="Method Name"
                  value={currentMethod.name}
                  onChange={(e) => handleMethodChange(e, "name")}
                />
                <Input
                  placeholder="Delivery Time"
                  value={currentMethod.time}
                  onChange={(e) => handleMethodChange(e, "time")}
                />
                <Input placeholder="Cost" value={currentMethod.cost} onChange={(e) => handleMethodChange(e, "cost")} />
                <select
                  value={currentMethod.icon}
                  onChange={(e) => handleMethodChange(e, "icon")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Truck">Truck</option>
                  <option value="Plane">Plane</option>
                  <option value="Globe">Globe</option>
                  <option value="Package">Package</option>
                </select>
              </div>

              {formData.methods && formData.methods.length > 0 ? (
                <div className="space-y-3">
                  {formData.methods.map((method, index) => (
                    <div key={index} className="bg-white p-3 rounded border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{method.name}</span>
                        <Button
                          type="button"
                          onClick={() => removeMethod(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Time:</span> {method.time}
                        </div>
                        <div>
                          <span className="font-medium">Cost:</span> {method.cost}
                        </div>
                        <div>
                          <span className="font-medium">Icon:</span> {method.icon}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No shipping methods added yet.</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" onClick={isEditing ? cancelEditing : cancelAdding} variant="outline">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={isEditing ? updateShippingInfo : saveShippingInfo}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Save size={16} className="mr-2" /> {isEditing ? "Update" : "Save"}
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700"></div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shipping & Returns Management</h1>
            <p className="text-gray-600">Manage shipping methods and return policy information</p>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard/contact">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Manage Contact Info
              </button>
            </Link>
            <Link href="/shipping">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                View Shipping Page
              </button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="shipping">Shipping Information</TabsTrigger>
            <TabsTrigger value="returns">Return Policy</TabsTrigger>
          </TabsList>

          <TabsContent value="shipping">
            <div className="mb-6 flex justify-end">
              <Button onClick={startAdding} className="bg-teal-600 hover:bg-teal-700 text-white">
                <Plus size={16} className="mr-2" /> Add Shipping Information
              </Button>
            </div>

            {(isAdding || isEditing) && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">
                  {isEditing ? "Edit Shipping Information" : "Add Shipping Information"}
                </h2>
                {renderForm()}
              </div>
            )}

            {/* Shipping Info List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Content
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Order
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shippingInfo
                    .filter((item) => item.type === "domestic" || item.type === "international")
                    .map((item) => (
                      <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">
                            {getTypeLabel(item.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{item.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {item.methods ? (
                              <span>{item.methods.length} shipping methods</span>
                            ) : (
                              <span>{item.content?.substring(0, 50) || "No content"}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.order}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => startEditing(item)}
                              variant="outline"
                              size="sm"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit size={16} />
                            </Button>
                            <DeleteConfirmationDialog
                              title="Delete Shipping Information"
                              description="Are you sure you want to delete this shipping information? This action cannot be undone."
                              itemName={item.title}
                              onConfirm={() => deleteShippingInfo(item._id)}
                              buttonSize="icon"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="returns">
            <div className="mb-6 flex justify-end">
              <Button onClick={startAdding} className="bg-teal-600 hover:bg-teal-700 text-white">
                <Plus size={16} className="mr-2" /> Add Return Policy Information
              </Button>
            </div>

            {(isAdding || isEditing) && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">
                  {isEditing ? "Edit Return Policy Information" : "Add Return Policy Information"}
                </h2>
                {renderForm()}
              </div>
            )}

            {/* Return Policy Info List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Content
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Order
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shippingInfo
                    .filter((item) => item.type !== "domestic" && item.type !== "international")
                    .map((item) => (
                      <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                            {getTypeLabel(item.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{item.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {item.items ? (
                              <span>{item.items.length} items</span>
                            ) : (
                              <span>{item.content?.substring(0, 50) || "No content"}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.order}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => startEditing(item)}
                              variant="outline"
                              size="sm"
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit size={16} />
                            </Button>
                            <DeleteConfirmationDialog
                              title="Delete Shipping Information"
                              description="Are you sure you want to delete this shipping information? This action cannot be undone."
                              itemName={item.title}
                              onConfirm={() => deleteShippingInfo(item._id)}
                              buttonSize="icon"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
