"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Tag, Percent, DollarSign, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

interface Coupon {
  _id: string
  code: string
  description: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  minimum_purchase: number
  start_date: string
  expiry_date: string
  usage_limit: number
  usage_count: number
  is_active: boolean
  applies_to: "all" | "categories" | "products"
  applicable_categories?: string[]
  applicable_products?: string[]
}

export default  function EditCouponPage({ params }: { params: Promise<{ id: string }>}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  // Form state
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")
  const [discountValue, setDiscountValue] = useState("")
  const [minimumPurchase, setMinimumPurchase] = useState("")
  const [startDate, setStartDate] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [usageLimit, setUsageLimit] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [appliesTo, setAppliesTo] = useState<"all" | "categories" | "products">("all")
  const [id, setId] = useState("")
  useEffect(() => {
    const fetchId = async () => {
      const param = await params
      setId(param.id)
    }
    fetchId()
  }, [params])
 const fetchCoupon =useCallback( async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/coupons/${id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch coupon")
      }

      const data = await response.json()
      setCoupon(data)

      // Populate form fields
      setCode(data.code)
      setDescription(data.description)
      setDiscountType(data.discount_type)
      setDiscountValue(data.discount_value.toString())
      setMinimumPurchase(data.minimum_purchase.toString())
      setStartDate(new Date(data.start_date).toISOString().split("T")[0])
      setExpiryDate(new Date(data.expiry_date).toISOString().split("T")[0])
      setUsageLimit(data.usage_limit.toString())
      setIsActive(data.is_active)
      setAppliesTo(data.applies_to)
    } catch (error) {
      console.error("Error fetching coupon:", error)
      toast({
        title: "Error",
        description: "Failed to load coupon details",
        variant: "destructive",
      })
      router.push("/dashboard/coupons")
    } finally {
      setIsLoading(false)
    }
  }, [ id, router, toast ])
  useEffect(() => {
    fetchCoupon()
  }, [id, fetchCoupon])

 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!code || !description || !discountValue || !expiryDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Validate discount value
    const discountValueNum = Number.parseFloat(discountValue)
    if (isNaN(discountValueNum) || discountValueNum <= 0) {
      toast({
        title: "Error",
        description: "Discount value must be a positive number",
        variant: "destructive",
      })
      return
    }

    // Validate percentage discount (max 100%)
    if (discountType === "percentage" && discountValueNum > 100) {
      toast({
        title: "Error",
        description: "Percentage discount cannot exceed 100%",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const couponData = {
        code,
        description,
        discount_type: discountType,
        discount_value: discountValueNum,
        minimum_purchase: minimumPurchase ? Number.parseFloat(minimumPurchase) : 0,
        start_date: startDate,
        expiry_date: expiryDate,
        usage_limit: usageLimit ? Number.parseInt(usageLimit) : 0,
        is_active: isActive,
        applies_to: appliesTo,
        // Preserve existing applicable items
        applicable_categories: coupon?.applicable_categories,
        applicable_products: coupon?.applicable_products,
      }

      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(couponData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update coupon")
      }

      toast({
        title: "Success",
        description: "Coupon updated successfully",
      })

      router.push("/dashboard/coupons")
    } catch (error) {
      console.error("Error updating coupon:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update coupon",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.push("/dashboard/coupons")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Coupons
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Skeleton className="h-[500px] w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[100px] w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-7">
      <div className="flex items-center justify-between mb-6">
        <Button  variant="ghost" onClick={() => router.push("/dashboard/coupons")} className="mr-4 bg-teal-600 hover:bg-teal-700 text-white hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Coupons
        </Button>
        <h1 className="text-2xl font-bold">Edit Coupon</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main coupon details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Coupon Details</CardTitle>
              <CardDescription>Update your discount coupon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 mb-4">
                <Label htmlFor="code" className="mb-2 text-lg block">
                  Coupon Code <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="code"
                    placeholder="SUMMER2023"
                    className="pl-10"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <p className="text-sm text-gray-500">Customers will enter this code at checkout</p>
              </div>

              <div className="space-y-2 mb-4">
                <Label htmlFor="description" className="mb-2 text-lg block">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Summer sale discount"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">Brief description of what this coupon is for</p>
              </div>

              <Separator />

              <div className="space-y-4 mb-4">
                <Label className="text-lg block">
                  Discount Type <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={discountType}
                  onValueChange={(value) => setDiscountType(value as "percentage" | "fixed")}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label htmlFor="percentage" className="flex items-center">
                      <Percent className="mr-2 h-4 w-4" />
                      Percentage Discount
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed" className="flex items-center">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Fixed Amount Discount
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2 mb-4">
                <Label htmlFor="discountValue" className="mb-2 text-lg block">
                  Discount Value <span className="text-red-500 ">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">
                    {discountType === "percentage" ? "%" : "₹"}
                  </span>
                  <Input
                    id="discountValue"
                    type="number"
                    placeholder={discountType === "percentage" ? "10" : "500"}
                    className="pl-8"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    min="0"
                    max={discountType === "percentage" ? "100" : undefined}
                    step="0.01"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500">
                  {discountType === "percentage"
                    ? "Percentage off the order total (max 100%)"
                    : "Fixed amount off the order total"}
                </p>
              </div>

              <div className="space-y-2 mb-4">
                <Label htmlFor="minimumPurchase" className="mb-2 text-lg block">Minimum Purchase Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1.5 text-gray-500">₹</span>
                  <Input
                    id="minimumPurchase"
                    type="number"
                    placeholder="1000"
                    className="pl-8"
                    value={minimumPurchase}
                    onChange={(e) => setMinimumPurchase(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Minimum order amount required to use this coupon (0 for no minimum)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Coupon Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2 mb-4">
                  <Label htmlFor="startDate" className="mb-2 text-lg block">Start Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="startDate"
                      type="date"
                      className="pl-10"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <Label htmlFor="expiryDate" className="mb-2 text-lg block">
                    Expiry Date <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="expiryDate"
                      type="date"
                      className="pl-10"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <Label htmlFor="usageLimit" className="mb-2 text-lg block">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    placeholder="100"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    min="0"
                  />
                  <p className="text-sm text-gray-500">
                    Maximum number of times this coupon can be used (0 for unlimited)
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive" className=" text-lg ">Active</Label>
                  <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                </div>

                <Separator />

                <div className="space-y-2 mb-4">
                  <Label htmlFor="appliesTo" className="mb-2 text-lg block">Applies To</Label>
                  <Select
                    value={appliesTo}
                    onValueChange={(value) => setAppliesTo(value as "all" | "categories" | "products")}
                  >
                    <SelectTrigger id="appliesTo">
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="categories">Specific Categories</SelectItem>
                      <SelectItem value="products">Specific Products</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">Determine which products this coupon can be applied to</p>
                </div>

                {appliesTo !== "all" && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                    <Info className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800">
                      You can select specific
                      {appliesTo === "categories" ? " categories" : " products"}
                      in the advanced settings section.
                    </p>
                  </div>
                )}

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-500 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    This coupon has been used {coupon?.usage_count || 0} times
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button type="submit" className="w-full text-lg py-4 bg-teal-600 font-light hover:bg-teal-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Coupon"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
