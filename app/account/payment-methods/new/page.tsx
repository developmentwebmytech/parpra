"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import UserAccountSidebar from "@/components/user-account-sidebar"

export default function NewPaymentMethodPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [cardType, setCardType] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiryMonth, setExpiryMonth] = useState("")
  const [expiryYear, setExpiryYear] = useState("")
  const [cvv, setCvv] = useState("")
  const [isDefault, setIsDefault] = useState(false)

  if (status === "unauthenticated") {
    router.push("/login?redirect=/account/payment-methods/new")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Basic validation
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      toast({
        title: "Error",
        description: "Please enter a valid card number",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (cvv.length < 3 || cvv.length > 4) {
      toast({
        title: "Error",
        description: "Please enter a valid CVV",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // In a real application, you would use a payment processor SDK
      // to tokenize the card details securely before sending to your server

      // For this demo, we'll just store the last 4 digits
      const lastFour = cardNumber.slice(-4)

      const response = await fetch("/api/user/payment-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          card_type: cardType,
          last_four: lastFour,
          expiry_month: expiryMonth,
          expiry_year: expiryYear,
          is_default: isDefault,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add payment method")
      }

      toast({
        title: "Success",
        description: "Payment method added successfully",
      })

      router.push("/account/payment-methods")
    } catch (error) {
      console.error("Error adding payment method:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add payment method",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    return month.toString().padStart(2, "0")
  })

  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => (currentYear + i).toString())

  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <UserAccountSidebar activeItem="payment-methods" />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white p-6 rounded-md shadow-sm">
              <h1 className="text-2xl font-medium mb-6">Add Payment Method</h1>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardType">Card Type</Label>
                  <Select value={cardType} onValueChange={setCardType} required>
                    <SelectTrigger id="cardType">
                      <SelectValue placeholder="Select card type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Visa">Visa</SelectItem>
                      <SelectItem value="Mastercard">Mastercard</SelectItem>
                      <SelectItem value="American Express">American Express</SelectItem>
                      <SelectItem value="Discover">Discover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                    maxLength={19}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryMonth">Expiry Month</Label>
                    <Select value={expiryMonth} onValueChange={setExpiryMonth} required>
                      <SelectTrigger id="expiryMonth">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiryYear">Expiry Year</Label>
                    <Select value={expiryYear} onValueChange={setExpiryYear} required>
                      <SelectTrigger id="expiryYear">
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                    maxLength={4}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isDefault"
                    checked={isDefault}
                    onCheckedChange={(checked) => setIsDefault(checked as boolean)}
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer">
                    Set as default payment method
                  </Label>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button type="submit" className="bg-amber-700 hover:bg-amber-800" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Payment Method"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/account/payment-methods")}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
