"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import UserAccountSidebar from "@/components/user-account-sidebar"

interface Address {
  _id: string
  user_id: string
  full_name: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
  is_default: boolean
  createdAt: string
  updatedAt: string
}

export default function AddressesPage() {
  const {  status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/user/addresses")
      if (!response.ok) {
        throw new Error("Failed to fetch addresses")
      }
      const data = await response.json()
      setAddresses(data.addresses || [])
    } catch (error) {
      console.error("Error fetching addresses:", error)
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
    if (status === "unauthenticated") {
      router.push("/login?redirect=/account/addresses")
    }

    if (status === "authenticated") {
      fetchAddresses()
    }
  }, [status, router, toast])

  

  const handleAddAddress = () => {
    router.push("/account/addresses/new")
  }

  const handleEditAddress = (id: string) => {
    router.push(`/account/addresses/${id}`)
  }

  const handleDeleteAddress = async (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      try {
        const response = await fetch(`/api/user/addresses/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete address")
        }

        // Update the addresses list
        setAddresses((prev) => prev.filter((address) => address._id !== id))

        toast({
          title: "Success",
          description: "Address deleted successfully",
        })
      } catch (error) {
        console.error("Error deleting address:", error)
        toast({
          title: "Error",
          description: "Failed to delete address",
          variant: "destructive",
        })
      }
    }
  }

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const address = addresses.find((a) => a._id === id)
      if (!address) return

      const response = await fetch(`/api/user/addresses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...address,
          is_default: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update address")
      }

      // Update the addresses list
      setAddresses((prev) =>
        prev.map((address) => ({
          ...address,
          is_default: address._id === id,
        })),
      )

      toast({
        title: "Success",
        description: "Default address updated",
      })
    } catch (error) {
      console.error("Error updating address:", error)
      toast({
        title: "Error",
        description: "Failed to update address",
        variant: "destructive",
      })
    }
  }

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="bg-neutral-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 lg:w-1/4">
              <Skeleton className="h-[400px] w-full rounded-md" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-12 w-1/3 mb-6" />
              <Skeleton className="h-[200px] w-full rounded-md mb-4" />
              <Skeleton className="h-[200px] w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <UserAccountSidebar activeItem="addresses" />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white p-6 rounded-md shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medium">My Addresses</h1>
                <Button className="bg-amber-700 hover:bg-amber-800" onClick={handleAddAddress}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Address
                </Button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-12 border rounded-md">
                  <p className="text-gray-500 mb-4">You don't have any saved addresses yet.</p>
                  <Button className="bg-amber-700 hover:bg-amber-800" onClick={handleAddAddress}>
                    Add New Address
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`border rounded-md p-4 ${address.is_default ? "border-amber-700 bg-amber-50" : ""}`}
                    >
                      {address.is_default && (
                        <div className="mb-2">
                          <span className="bg-amber-700 text-white text-xs px-2 py-1 rounded">Default</span>
                        </div>
                      )}
                      <p className="font-medium">{address.full_name}</p>
                      <p>{address.address_line1}</p>
                      {address.address_line2 && <p>{address.address_line2}</p>}
                      <p>
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                      <p>{address.country}</p>
                      <p className="mt-2">{address.phone}</p>

                      <div className="mt-4 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-amber-700 border-amber-700"
                          onClick={() => handleEditAddress(address._id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600"
                          onClick={() => handleDeleteAddress(address._id)}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        {!address.is_default && (
                          <Button variant="outline" size="sm" onClick={() => handleSetDefaultAddress(address._id)}>
                            Set as Default
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
