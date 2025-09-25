"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Tag, Percent, DollarSign, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

export default function NewCouponPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")
  const [discountValue, setDiscountValue] = useState("")
  const [minimumPurchase, setMinimumPurchase] = useState("")
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [expiryDate, setExpiryDate] = useState("")
  const [usageLimit, setUsageLimit] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [appliesTo, setAppliesTo] = useState<"all" | "categories" | "products">("all")

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

    // Validate expiry date
    const expiry = new Date(expiryDate)
    if (expiry <= new Date()) {
      toast({
        title: "Error",
        description: "Expiry date must be in the future",
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
      }

      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(couponData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create coupon")
      }

      toast({
        title: "Success",
        description: "Coupon created successfully",
      })

      router.push("/dashboard/coupons")
    } catch (error) {
      console.error("Error creating coupon:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create coupon",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push("/dashboard/coupons")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Coupons
        </Button>
        <h1 className="text-2xl font-bold">Create New Coupon</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main coupon details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Coupon Details</CardTitle>
              <CardDescription>Create a new discount coupon for your customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code">
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

              <div className="space-y-2">
                <Label htmlFor="description">
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

              <div className="space-y-4">
                <Label>
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

              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  Discount Value <span className="text-red-500">*</span>
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

              <div className="space-y-2">
                <Label htmlFor="minimumPurchase">Minimum Purchase Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">₹</span>
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
                <CardTitle>Coupon Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">
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

                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit</Label>
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
                  <Label htmlFor="isActive">Active</Label>
                  <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="appliesTo">Applies To</Label>
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
                      After creating the coupon, you'll be able to select specific
                      {appliesTo === "categories" ? " categories" : " products"}
                      on the edit page.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Coupon"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
